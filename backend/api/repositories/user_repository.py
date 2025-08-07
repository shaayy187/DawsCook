def update_password(user, new_password):
    user.set_password(new_password)
    user.save()

def update_email(user, new_email):
    user.email = new_email
    user.save()