#!/usr/bin/env python

from bluepy.btle import Scanner, DefaultDelegate, Peripheral, Service, UUID, Characteristic
import struct

from azure.storage.queue import QueueService , QueueMessage
from base64 import b64encode

import sys
import os

def restartScript():
    print sys.argv[0]
    os.execv(__file__,['python'] + [sys.argv[0]])

try:
    queue_service = QueueService(account_name='walksmart1',account_key='ZwEU627jtc7HbKxmzWvovaepw99Y47jP4WrVcCqR/i0xwQNo2Q0uSHnWUkBQhWH6rXFNt5JUnJB1S5F2Mbso1w==')
    queue_service.create_queue('pi-walk-items',timeout=5)
    
    exists = queue_service.exists('pi-walk-items')
    if exists == False:
        print("Queue Does Not Exist")
    else:
        print("Queue Set Up!")
except Exception, e:
    print "Queue Exception: ", e
    restartScript()
    



data_char_uuid = UUID('00000100-0000-1000-8000-00805f9b34fb')
data_return_char_uuid = UUID('00000101-0000-1000-8000-00805f9b34fb')

data_char = None
data_return_char = None
device = None

address = None

def connect(scanEntry):

    print("connecting...")
    try:
        addr = scanEntry.addr
        global address
        addr = addr.replace(':','')
        address = addr.upper()
        print 'address: ', address
        global device
        device = Peripheral(scanEntry)
        for x in device.getCharacteristics(uuid=data_return_char_uuid):
            print(x.uuid)
            global data_return_char
            data_return_char = x

        for x in device.getCharacteristics(uuid=data_char_uuid):
            global data_char
            data_char = x
            print(x.uuid)

        d = bytearray([1,1,1,1,1,1,1,1,1,1,1,1,1])
        writeData(d)
        readData()
        
    except Exception, e:
        print("disconnected")
        print(str(e))
        #scan()
    
        
    

def writeData(data):
    try:
        j = struct.pack('13B',data[0],data[1],data[2],data[3],data[4],data[5],data[6],data[7],data[8],data[9],data[10],data[11],data[12])
        data_return_char.write(j,True)
    except Exception, e:
        print str(e)
    readData()
    
def readData():
    g = data_char.read()
    f = bytearray()
    print("Data read:")
    for h in g:
            print ord(h)
            f.append(h)

    try:     
        
        
        if f[0] > 0 and f[0] < 60:

            rot = f[7] << 8 | f[8]
            dur = f[5] << 8 | f[6]

            
        
            message = '{"address":"' + address + \
                '","year":' + str(f[0]) + \
                ',"month":' + str(f[1]) + \
                ',"day":' + str(f[2]) + \
                ',"hour":' + str(f[3]) + \
                ',"minute":' + str(f[4]) + \
                ',"rotations":' + str(rot) + \
                ',"duration":' + str(dur) + '}'

            print(str(message))
            encoded_msg = b64encode(message)
            encoded_msg_text = encoded_msg.decode()
            try:
                queue_service.put_message(queue_name='pi-walk-items',content=encoded_msg_text,timeout=5)
            except Exception, e:
                print str(e)
                restartScript()
            print ("sent to queue")

                

            writeData(f)
            
        elif f[0] == 0:
            d = bytearray([1,1,1,1,1,1,1,1,1,1,1,1,1])
            writeData(d)
        elif f[0] == 62:
            writeData(f)
            global device
            device.disconnect()
        else:
            print("invalid data")
            
        
    except Exception, e:
        print "Exception Read: ", str(e)
        

class ScanDelegate(DefaultDelegate):
    def __init__(self):
        DefaultDelegate.__init__(self)

    def handleDiscovery(self, dev, isNewDev, isNewData):
        if isNewDev:
            for (adtype,desc,value) in dev.getScanData():
                if value == 'WalkSmart':
                    print "Discovered WalkSmart: ", dev.addr
                    global scanner
                    scanner.clear()
                    connect(dev)

def scan():
    print("Start Scanning")

    global scanner
    scanner.start()

    count = 0
    while True:
        print("process")
        scanner.process()
        count = count + 1
        if count == 3:
            break
        
    print("out of loop")
    restartScript()



def stopScan():
    print("Stopping Scan")
    global scanner
    scanner.stop()
    scanner.clear()

if __name__ == "__main__":
    global scanner
    scanner = Scanner().withDelegate(ScanDelegate())
    scan()


