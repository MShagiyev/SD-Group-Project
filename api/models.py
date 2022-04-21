from sqlalchemy import func, inspect
from sqlalchemy.orm import relationship, backref
from . import db


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(
        db.Integer,
        primary_key=True
    )
    fullName = db.Column(
        db.String(32)
    )
    email = db.Column(
        db.String(32),
        unique=True,
        nullable=False
    )
    password = db.Column(
        db.String(512),
        nullable=False
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    hasQuoted = db.Column(
        db.Boolean
    )
    quote = relationship("Quote", back_populates="user")

    address = relationship(
        "Address", backref=backref("address", uselist=False))

    address_id = db.Column(
        db.Integer,
        db.ForeignKey('address.id', ondelete="CASCADE")
    )


class Address(db.Model):
    __tablename__ = 'address'
    id = db.Column(
        db.Integer,
        primary_key=True
    )
    addLine1 = db.Column(
        db.String(64),
        nullable=False
    )
    addLine2 = db.Column(
        db.String(32),
        nullable=True
    )
    state = db.Column(
        db.String(2),
        nullable=False
    )
    city = db.Column(
        db.String(32),
        nullable=False
    )
    zip_code = db.Column(
        db.String(10),
        nullable=False
    )




class Quote(db.Model):
    __tablename__ = 'quote'
    id = db.Column(
        db.Integer,
        primary_key=True
    )
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('user.id', ondelete="CASCADE")
    )
    user = relationship("User", back_populates="quote")
    total = db.Column(
        db.Float,
        nullable=False
    )
    date = db.Column(
        db.String(10),
        nullable=False
    )
    def to_dict(self):
        return { quote.key: getattr(self, quote.key) for quote in inspect(self).mapper.column_attrs }