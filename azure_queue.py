from azure.storage.queue import QueueService
from base64 import b64encode

queue_service = QueueService(account_name='walksmart1',account_key='ZwEU627jtc7HbKxmzWvovaepw99Y47jP4WrVcCqR/i0xwQNo2Q0uSHnWUkBQhWH6rXFNt5JUnJB1S5F2Mbso1w==')
queue_service.create_queue('pi-walk-items')

print queue_service.exists('pi-walk-items')

message = 'this is it'
encoded_msg = b64encode(message)
encoded_msg_text = encoded_msg.decode()

queue_service.put_message('pi-walk-items',encoded_msg_text)

