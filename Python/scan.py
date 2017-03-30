from bluepy.btle import Scanner, DefaultDelegate, Peripheral, Service, UUID, Characteristic
import struct

data_char_uuid = UUID('00000100-0000-1000-8000-00805f9b34fb')
data_return_char_uuid = UUID('00000101-0000-1000-8000-00805f9b34fb')



def connect(scanEntry):
    scanner.stop()
    scanner.clear()
    print("connecting...")
    try:
        device = Peripheral(scanEntry)
    except:
        print("disconnected")

    
        
    for x in device.getCharacteristics(uuid=data_return_char_uuid):
        print(x.uuid)
        data_return_char = x
        
        d = bytearray([1,1,1,1,1,1,1,1,1,1,1,1,1])

        writeData(data_return_char,d)
        
    for x in device.getCharacteristics(uuid=data_char_uuid):
        data_char = x
        print(x.uuid)
        readData(data_char)

##    print type(data_return_char)
##    b = bytearray([1,1,1,1,1,1,1,1,1,1,1,1,1])
##    j = struct.pack('13B',1,1,1,1,1,1,1,1,1,1,1,1,1)
##    data_return_char.write(data=j,withResponse=True)
##    #writeData(data_return_char,b)
##    time.sleep(.300)
##    readData(data_char)

def writeData(char,data):
    try:
        j = struct.pack('13B',data[0],data[1],data[2],data[3],data[4],data[5],data[6],data[7],data[8],data[9],data[10],data[11],data[12])
        print(j)
        print type(char)
        char.write(j,True)
    except Exception, e:
        print str(e)
    
    
def readData(char):
    g = char.read()
    f = bytearray()
    print("Data read:")
    for h in g:
            print ord(h)
            f.append(h)
            
    return f
        

class ScanDelegate(DefaultDelegate):
    def __init__(self):
        DefaultDelegate.__init__(self)

    def handleDiscovery(self, dev, isNewDev, isNewData):
        if isNewDev:
            for (adtype,desc,value) in dev.getScanData():
                if value == 'WalkSmart':
                    print "Discovered WalkSmart: ", dev.addr
                    connect(dev)

scanner = Scanner().withDelegate(ScanDelegate())
try:
    scanner.start()
    scanner.process(10)
    scanner.stop()
    scanner.clear()
except:
    print("Scan Error")






    
##for dev in devices:
##    print "Device %s (%s), RSSI=%d dB" % (dev.addr, dev.addrType, dev.rssi)
##    for (adtype, desc, value) in dev.getScanData():
##        print "  %s : %s = %s" % (adtype, desc, value)
