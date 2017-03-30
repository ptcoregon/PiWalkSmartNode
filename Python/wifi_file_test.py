import os
from wireless import Wireless


def wifiFromBluetooth():
    greatestTime = 0
    fileToOpen = None

    for filename in os.listdir('/home/pi/bluetooth'):
        path = os.path.join('/home/pi/bluetooth',filename)
        if filename.endswith(".txt"):
            if os.path.getmtime(path) > greatestTime:
                fileToOpen = path

    return getPassSSIDfromFile(fileToOpen)

def wifiFromFile():
    path = '/home/pi/wifi/wifi.txt'
    return getPassSSIDfromFile(path)

def getPassSSIDfromFile(path):
    f = open(path)
    print f
    ssid = f.readline()
    password = f.readline()
    ssid = ssid.strip('\r\n')
    ssid = ssid.strip('\n\r')
    password = password.strip('\r\n')
    password = password.strip('\n\r')
    f.close()
    print [ssid,password]

    return [ssid,password]

def connectToWifi(lines):
    status = None
    try:
        w = Wireless()
        status = w.connect(lines[0],lines[1])
        print status
        if status == False:
            print "Unsuccessful"
        else:
            print "Successful Connection"
    except Exception, e:
        print str(e)
    
    return status

p = wifiFromFile()
status = connectToWifi(p)
if status == False:
    p = wifiFromBluetooth()
    status = connectToWifi(p)
    if status == False:
        print "Need new SSID or Password"
