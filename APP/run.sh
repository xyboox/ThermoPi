deviceLst=$(adb devices | awk 'NR > 1 {print $1}' | sed ':a;N;$!ba;s/\n/ /g')

IFS=' ' read -a array <<< "$deviceLst"

cd platforms

for element in "${array[@]}"
do
    cordova run android --target=$element
done

cd ..