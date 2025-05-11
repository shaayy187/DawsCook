import pika
import json

def send_user_registered(username, email):
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters("rabbitmq"))
        channel = connection.channel()
        channel.queue_declare(queue="user_registered_queue", durable=True)

        message = {
            "username": username,
            "email": email
        }

        channel.basic_publish(
            exchange='',
            routing_key='user_registered_queue',
            body=json.dumps(message),
            properties=pika.BasicProperties(delivery_mode=2)
        )

        connection.close()
        print(f"Queued registration message for user: {username}")
    except Exception as e:
        print("RabbitMQ error:", e)
