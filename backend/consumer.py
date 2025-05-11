import pika
import json

def callback(ch, method, properties, body):
    data = json.loads(body)
    print(f"[x] New user registered: {data['username']} ({data['email']})")
    ch.basic_ack(delivery_tag=method.delivery_tag)

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()
channel.queue_declare(queue='user_registered_queue', durable=True)
channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='user_registered_queue', on_message_callback=callback)

print("[*] Waiting for new users. Press CTRL+C to stop.")
channel.start_consuming()
