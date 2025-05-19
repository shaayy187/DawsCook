import pika
import json
from message import send_welcome_email

def callback(ch, method, properties, body):
    data = json.loads(body)
    username = data['username']
    email = data['email']

    print(f"[x] New user registered: {username} ({email})")

    send_welcome_email(username, email)

    ch.basic_ack(delivery_tag=method.delivery_tag)

connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq'))
channel = connection.channel()
channel.queue_declare(queue='user_registered_queue', durable=True)
channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='user_registered_queue', on_message_callback=callback)

print("[*] Waiting for new users. Press CTRL+C to stop.")
channel.start_consuming()
