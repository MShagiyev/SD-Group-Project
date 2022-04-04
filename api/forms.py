from flask_wtf import FlaskForm
from wtforms import (StringField, PasswordField,
                     IntegerField, DecimalField, ValidationError, DateField)
from wtforms.validators import (
    InputRequired, Length, Email, DataRequired, NumberRange, Optional, AnyOf)
from werkzeug.security import check_password_hash
from .constants import states
from datetime import datetime
from re import match
from .models import User
from . import db

class IsDate(object):
    def __init__(self, message=None) -> None:
        if not message:
            message = "Incorrect date format"
        self.message = message

    def __call__(self, form, field: StringField):
        res_date = field.data
        try:
            test = datetime.strptime(res_date, "%a %b %d %Y")
            field.data = test
        except:
            raise ValidationError(self.message)
        
class IsNumber(object):
    def __init__(self, message=None) -> None:
        if not message:
            message = "Must be a number."
        self.message = message

    def __call__(self, form, field):
        valid = match("(^\d{5}$)|(^\d{9}$)|(^\d{5}-\d{4}$)$", str(field.data))
        if not valid:
            raise ValidationError(self.message)

class IsAlpha(object):
    def __init__(self, message=None) -> None:
        if not message:
            message = "Must be alphabetic."
        self.message = message

    def __call__(self, form, field):
        valid = match("^[A-Za-z ]*$", field.data)
        if not valid:
            raise ValidationError(self.message)
        words = field.data.split(" ")
        field.data = " ".join([word.capitalize() for word in words])
        print(field.data)


class RegisterForm(FlaskForm):
    email = StringField('email', validators=[InputRequired(),
                                             Email(
                                                 message="Please enter a valid email."),
                                             ])
    password = PasswordField('password', validators=[
                             DataRequired(message="Please enter a password.")])

    def validate_email(form, email):
        if email.data:
            if User.query.filter( User.email == email.data ).first():
                raise ValidationError("User with that email already exists. Try logging in instead.")


class LoginForm(FlaskForm):
    email = StringField('email', validators=[InputRequired(),
                                             Email(message="Please enter a valid email.")])
    password = PasswordField('password', validators=[
                             InputRequired(message="Please enter a password.")])
    def validate_email(form, field):
        found = User.query.filter( User.email == field.data ).first()
        if not found or not check_password_hash(found.password, form.password.data):
            raise ValidationError("Invalid email or password.")

class ProfileForm(FlaskForm):
    id = IntegerField('User ID')
    fullName = StringField('Full Name', validators=[
        InputRequired("Please enter a name."),
        Length(min=1, max=32, message="Please enter a name between 1-32 characters."),
        IsAlpha(message="Name must only contain alphabetic characters.")])
    add1 = StringField('Address Line 1', validators=[InputRequired(
        message="Please provide an address.")])
    add2 = StringField('Address Line 2', validators=[Optional(True)])
    state = StringField('State', validators=[
                        InputRequired(
                            message="Please enter a valid US State."),
                        AnyOf(states, message="Please enter a valid US state.")])
    city = StringField('City', validators=[
                       InputRequired(message="Please enter a city."),
                       IsAlpha(message="City must only be alphabetic characters.")])
    zipCode = StringField('Zip Code', validators=[
        InputRequired(message="Please enter a zip code."),
        IsNumber(message="Zip Code must be a number either 5 or 10 digits long (including hyphen)")])

    def validate_add1(form, field):
        found = match("^[0-9]+", field.data)
        if not found:
            raise ValidationError("Address must start with a number.")
    def filter(form, all_fields):
        for field in all_fields:
            print("label is:", field.label)
            if(field.label.text != "User ID"):
                field.data = " ".join(field.data.split())


class QuoteForm(FlaskForm):
    id = IntegerField('User ID')
    gallons = IntegerField('Gallons', validators=[InputRequired(
        message="Please enter a number."), NumberRange(min=1, message="Please enter a number greater than 0."),])
    total = DecimalField('Total', validators=[InputRequired(), NumberRange(
        min=0.01, message="Cannot have a total less than 0.")])
    suggested = DecimalField('Suggested Price', validators=[InputRequired(message="Please click 'See Quote' before submitting."), NumberRange(
        min=0.01, message="Cannot have a suggested price/gal less than 0.")])
    date = StringField('Date', validators=[InputRequired(
        message="Please enter a date."), IsDate(message="Invalid date format.")])
