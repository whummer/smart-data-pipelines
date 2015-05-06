#!/usr/bin/env bash

jmap -dump:live,format=b,file=$1 $2
