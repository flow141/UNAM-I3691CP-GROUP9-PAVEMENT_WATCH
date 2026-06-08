import 'package:flutter/material.dart';
import 'report_screen.dart';

class HomeScreen extends StatelessWidget {

@override

Widget build(BuildContext context){

return Scaffold(

appBar: AppBar(

title: Text("Pavement Watch"),

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
