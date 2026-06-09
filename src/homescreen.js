import React,{useState} from "react";

import {

View,

Button,

Image,

Text

} from "react-native";

import {

launchCamera

} from "react-native-image-picker";

import Geolocation from

"react-native-geolocation-service";

import uploadReport from

"../services/firebaseService";

export default function ReportScreen(){

const [photo,setPhoto]=useState(null);

const [location,setLocation]=

useState(null);

function takePhoto(){

launchCamera(

{

mediaType:"photo"

},

response=>{

if(response.assets){

setPhoto(

response.assets[0]

)

}

}

)

}

function getGPS(){

Geolocation.getCurrentPosition(

position=>{

setLocation(position.coords)

}

)

}

async function submit(){

if(photo && location){

await uploadReport(

photo,

location

)

alert("Submitted")

}

}

return(

<View>

<Button

title="Take Photo"

onPress={takePhoto}

/>

<Button

title="Get GPS"

onPress={getGPS}

/>

<Button

title="Submit"

onPress={submit}

/>

{

photo &&

<Image

source={{uri:photo.uri}}

style={{

width:200,

height:200

}}

/>

}

<Text>

{

location ?

`${location.latitude}`

:

"No Location"

}

</Text>

</View>

)

}
