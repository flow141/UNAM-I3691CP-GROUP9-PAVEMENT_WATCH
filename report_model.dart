class Report {

String imageUrl;
CXVDFB 
double latitude;

double longitude;

String status;

Report({

required this.imageUrl,

required this.latitude,

required this.longitude,

required this.status,

});

Map<String,dynamic> toMap(){

return{

'imageUrl':imageUrl,

'latitude':latitude,

'longitude':longitude,

'status':status

};

}

}
