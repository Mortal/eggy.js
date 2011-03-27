#!/bin/sh
PIDS=""
atexit() {
	kill $PIDS
}
trap atexit EXIT
for i in $*; do
	echo start $i
	node modules/$i.js & PIDS="$PIDS $!"
	echo $!
done
read j
