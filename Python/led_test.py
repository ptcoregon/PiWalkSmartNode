#!/usr/bin/python

import RPi.GPIO as GPIO
from time import sleep

GPIO.setmode(GPIO.BCM)

GPIO.setup(16,GPIO.OUT)

GPIO.output(16,GPIO.LOW)

sleep(5)

GPIO.output(16,GPIO.HIGH)
