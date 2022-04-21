from flask import jsonify, request, make_response
from flask import current_app as app
from flask_jwt_extended import (create_access_token, get_jwt_identity, get_jwt, jwt_required, decode_token)
from werkzeug.security import (generate_password_hash)

from datetime import datetime, timezone, timedelta
import json

from .forms import (LoginForm, ProfileForm, QuoteForm, RegisterForm)
from .models import (User, Quote, Address)
from . import db

@app.after_request
def refresh_tokens(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            body = response.get_json()
            if type(body) is dict:
                body["access_token"] = access_token
                response = json.dumps(body)
        return response
    except (RuntimeError, KeyError):
        print(response.data)
        # Case where there is not a valid JWT. Just return the original respone
        return response

@app.route('/verify', methods=['GET'])
@jwt_required()
def is_init():
    token = request.values["token"]
    decoded = decode_token(token)
    if "sub" in decoded:
        user = User.query.filter( User.email == decoded["sub"] ).first()
        return {"id": user.id, 
                "init": "true" if (user.fullName or user.address_id) else "false"} 
    return decoded
@app.route('/get_quote_details', methods=['GET'])
@jwt_required()
def get_quote_details():
    user_id = request.values["id"]
    user = User.query.filter( User.id == user_id ).first()
    address = Address.query.filter( Address.id == user.address_id ).first()
    reqs = [address.addLine1, address.city, address.state, address.zip_code]
    formatted_address = ", ".join([add_line for add_line in reqs])
    return make_response({"full_add": formatted_address, "add2": address.addLine2})
@app.route('/get_quote', methods=['GET'])
@jwt_required()
def get_quote():
    try:
        user_id = request.values["id"]
        gallons = request.values["galls"]
        user = User.query.filter( User.id == user_id ).first()
        address = Address.query.filter( Address.id == user.address_id ).first()

        location_factor = .02 if address.state == "TX" else .04
        history_factor = .01 if user.hasQuoted else 0
        gals_amount_factor = .02 if int(gallons) > 1000 else .03
        constant_factor = .1

        margin = (location_factor - history_factor + gals_amount_factor + constant_factor) * 1.50
        suggested = 1.5 + margin
        total = int(gallons) * suggested
        
        return({"suggested": "{:0.2f}".format(suggested), "total": "{:0.2f}".format(total)}, 200)
    except (ValueError, TypeError):
        return({"error": "Gallons must be an integer value."}, 400)
@app.route('/get_profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = request.values["id"]
    user = User.query.filter( User.id == user_id ).first()
    address = Address.query.filter( Address.id == user.address_id ).first()
    res = {
        'fullName': user.fullName,
        'add1': address.addLine1,
        'add2': address.addLine2,
        'state': address.state,
        'city': address.city,
        'zipCode': address.zip_code
    }
    return make_response(res, 200)

@app.route('/get-history', methods=['GET'])
def get_history():
    user_id = request.values["id"]
    all_quotes = Quote.query.filter( Quote.user_id == user_id).all()
    quotes = [quote.to_dict() for quote in all_quotes]
    return json.dumps(quotes)
#Persist data within post routes
#login post route
@app.route('/', methods=['POST'])
def login():
    login_form = LoginForm(request.form)
    if not login_form.validate():
        return make_response(login_form.errors, 400)
    user = User.query.filter( User.email == login_form.email.data ).first()
    token = create_access_token(identity=login_form.email.data)
    return make_response({"token": token, "init": "true" if user.fullName else "false"}, 200)

#profile post route
@app.route('/profile', methods=['POST'])
@jwt_required()
def profile_details():
    # not the best tbh can be refactored 
    prof_form = ProfileForm(request.form)
    prof_form.filter(prof_form)
    if not prof_form.validate():
        return make_response(prof_form.errors, 400)
    details = prof_form.data
    
    user = User.query.filter(User.id == int(details["id"])).first()
    if not user.fullName:
        new_address = Address(
            addLine1 = details["add1"],
            addLine2 = Address.addLine2 if details["add2"] == '' else details["add2"],
            city = details["city"],
            state = details["state"],
            zip_code = details["zipCode"]
        ) 
        db.session.add(new_address)
        db.session.flush()
        db.session.query(User).filter(User.id == int(details["id"])).\
                                update({'fullName': details["fullName"],
                                        'hasQuoted': False,
                                        'address_id': new_address.id
                                })
        db.session.commit()
    else:
        existing_add = Address.query.filter(Address.id == user.address_id)
        existing_add.update({
            'addLine1': details["add1"],
            'addLine2': details["add2"] if details["add2"] != '' else Address.addLine2,
            'state': details["state"],
            'city': details["city"],
            'zip_code': details["zipCode"]
        })
        User.query.filter(User.id == int(details["id"])).\
        update({
            'fullName': details["fullName"]
        })
        db.session.commit()

    return make_response("", 200)
    
#register post route
@app.route('/register', methods=['POST'])
def register():
    register_form = RegisterForm(request.form)
    if not register_form.validate():
        return make_response(register_form.errors, 400)
    new_user = User(
        email=register_form.email.data,
        password=generate_password_hash(register_form.password.data),
        hasQuoted=False
    )
    db.session.add(new_user)
    db.session.commit()

    token = create_access_token(identity=register_form.email.data)
    return make_response({"token": token} ,200)

#quote post route
@app.route('/quote', methods=['POST'])
@jwt_required()
def submit_quote():
    quote_form = QuoteForm(request.form)
    if not quote_form.validate():
        return make_response(quote_form.errors, 400)
    new_quote = Quote(
        user_id = int(quote_form.id.data),
        total = quote_form.total.data,
        date = quote_form.date.data
    )
    db.session.add(new_quote)
    db.session.commit()
    return make_response("", 200)

