import storage from

'@react-native-firebase/storage';

import firestore from

'@react-native-firebase/firestore';

export default async function

uploadReport(

photo,

location

){

const filename=

Date.now()+".jpg";

const reference=

storage()

.ref(

`reports/${filename}`

);

await reference.putFile(

photo.uri

);

const imageURL=

await reference.getDownloadURL();

await firestore()

.collection("reports")

.add({

image:imageURL,

latitude:

location.latitude,

longitude:

location.longitude,

status:"Pending",

timestamp:

Date.now()

});

}
