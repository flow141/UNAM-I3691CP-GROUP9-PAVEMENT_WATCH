
),

body: Center(

child: ElevatedButton(

child: Text("Report Pothole"),

onPressed: (){

Navigator.push(

context,

MaterialPageRoute(

builder:(context)=>ReportScreen()

)

);

},

),

),

);

}

}
