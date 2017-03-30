from azure.storage.queue import QueueService
from base64 import b64encode

queue_service = QueueService(account_name='walksmart1',account_key='ZwEU627jtc7HbKxmzWvovaepw99Y47jP4WrVcCqR/i0xwQNo2Q0uSHnWUkBQhWH6rXFNt5JUnJB1S5F2Mbso1w==')
queue_service.create_queue('pi-walk-items')

print queue_service.exists('pi-walk-items')

message = '{"address": "C449C2FA3DB2",' + \
    '"rotations" : 10, "duration": 16, "year":17,"month":3,"day":17,"hour":7,"minute":13}'
encoded_msg = b64encode(message)
encoded_msg_text = encoded_msg.decode()

print("start")

queue_service.put_message('pi-walk-items',encoded_msg_text)
print("end")

