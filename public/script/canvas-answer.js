window.onload = function() {
    var canvas = document.getElementById('solution');
      if(!canvas)
        {
            alert("Unable to retrieve the canvas");
            return;
        }

    var context = canvas.getContext('2d');
        if(!context)
        {
            alert("Unable to retrieve the context canvas");
            return;
        }

    var groupe = ['Animals', 'Insects', 'Vertebrates', 'Actinopterygians', 'Tetrapods', 'Squamates', 'Amphibians', 'Birds', 'Mammals'];
    var attributs = ['Head and mouth', 'External skeleton, 3 pairs of legs, 1 pair of antennae', 'Internal skeleton', 'Ray fins', '4 limbs', 'Scales', '4 fingers', 'Gesier et plumes', 'Hair and mammals'];
    var especes = ['Bird', 'White wolf', 'Hare', 'Bluefin tuna', 'Honeybee', 'Bluefin tuna', ' Mouse'];

    var FONT_ATTRIBUTS = "italic 14pt 'Alagard'",
        FONT_ATTRIBUTS_COLOR = "#ffe87b",
        FONT_GROUPE = "14pt 'Alagard'",
        FONT_GROUPE_COLOR = "#ffd200",
        FONT_ESPECE = "14pt 'Alagard'",
        FONT_ESPECE_COLOR = "#ffffff";

    var RECT_BORDER = "#c18218",
        RECT_GROUPE1 = "#422002",
        RECT_GROUPE2 = "#301701",
        RECT_GROUPE3 = "#241100";

    // bloc animaux

    context.beginPath();
    context.strokeStyle = "#ffd200";
    context.lineWidth = "2";
    context.rect(0,30,798,568);
    context.fillStyle = "#592b03";
    context.fill();
    context.stroke();

    context.font = FONT_ATTRIBUTS;
    context.fillStyle = FONT_ATTRIBUTS_COLOR;
    context.textAlign="start";
    context.fillText(attributs[0], 5, 25);

    context.font = FONT_GROUPE;
    context.fillStyle = FONT_GROUPE_COLOR;
    context.textAlign="end";
    context.fillText(groupe[0], 795, 25);

    // bloc insectes  

    context.beginPath();
    context.strokeStyle = RECT_BORDER;
    context.lineWidth = "2";
    context.rect(10,70,780,50);
    context.fillStyle = RECT_GROUPE1;
    context.fill();
    context.stroke(); 

    context.font = FONT_ATTRIBUTS;
    context.fillStyle = FONT_ATTRIBUTS_COLOR;
    context.textAlign="start";
    context.fillText(attributs[1], 15, 65);

    context.font = FONT_GROUPE;
    context.fillStyle = FONT_GROUPE_COLOR;
    context.textAlign="end";
    context.fillText(groupe[1], 785, 65);

    context.font = FONT_ESPECE;
    context.fillStyle = FONT_ESPECE_COLOR;
    context.textAlign="center";
    context.fillText(especes[0] + ", " + especes[1], 400, 105);

    // bloc vertebres 

    context.beginPath();
    context.strokeStyle = RECT_BORDER;
    context.lineWidth = "2";
    context.rect(10,160,780,430);
    context.fillStyle = RECT_GROUPE1;
    context.fill();
    context.stroke(); 

    context.font = FONT_ATTRIBUTS;
    context.fillStyle = FONT_ATTRIBUTS_COLOR;
    context.textAlign="start";
    context.fillText(attributs[2], 15, 155);

    context.font = FONT_GROUPE;
    context.fillStyle = FONT_GROUPE_COLOR;
    context.textAlign="end";
    context.fillText(groupe[2], 785, 155);

    // bloc actinopterygiens

    context.beginPath();
    context.strokeStyle = RECT_BORDER;
    context.lineWidth = "2";
    context.rect(20,200,760,50);
    context.fillStyle = RECT_GROUPE2;
    context.fill();
    context.stroke(); 

    context.font = FONT_ATTRIBUTS;
    context.fillStyle = FONT_ATTRIBUTS_COLOR;
    context.textAlign="start";
    context.fillText(attributs[3], 25, 195);

    context.font = FONT_GROUPE;
    context.fillStyle = FONT_GROUPE_COLOR;
    context.textAlign="end";
    context.fillText(groupe[3], 775, 195);
    
    context.font = FONT_ESPECE;
    context.fillStyle = FONT_ESPECE_COLOR;
    context.textAlign="center";
    context.fillText(especes[2], 400, 235);

    // tetrapodes

    context.beginPath();
    context.strokeStyle = RECT_BORDER;
    context.lineWidth = "2";
    context.rect(20,290,760,290);
    context.fillStyle = RECT_GROUPE2;
    context.fill();
    context.stroke(); 

    context.font = FONT_ATTRIBUTS;
    context.fillStyle = FONT_ATTRIBUTS_COLOR;
    context.textAlign="start";
    context.fillText(attributs[4], 25, 285);

    context.font = FONT_GROUPE;
    context.fillStyle = FONT_GROUPE_COLOR;
    context.textAlign="end";
    context.fillText(groupe[4], 775, 285);

    // squamates

    context.beginPath();
    context.strokeStyle = RECT_BORDER;
    context.lineWidth = "2";
    context.rect(30,320,360,50);
    context.fillStyle = RECT_GROUPE3;
    context.fill();
    context.stroke(); 

    context.font = FONT_ATTRIBUTS;
    context.fillStyle = FONT_ATTRIBUTS_COLOR;
    context.textAlign="start";
    context.fillText(attributs[5], 35, 315);

    context.font = FONT_GROUPE;
    context.fillStyle = FONT_GROUPE_COLOR;
    context.textAlign="end";
    context.fillText(groupe[5], 385, 315);

    context.font = FONT_ESPECE;
    context.fillStyle = FONT_ESPECE_COLOR;
    context.textAlign="center";
    context.fillText(especes[3], 200, 355);

    // amphibiens

    context.beginPath();
    context.strokeStyle = RECT_BORDER;
    context.lineWidth = "2";
    context.rect(410,320,360,50);
    context.fillStyle = RECT_GROUPE3;
    context.fill();
    context.stroke(); 

    context.font = FONT_ATTRIBUTS;
    context.fillStyle = FONT_ATTRIBUTS_COLOR;
    context.textAlign="start";
    context.fillText(attributs[6], 415, 315);

    context.font = FONT_GROUPE;
    context.fillStyle = FONT_GROUPE_COLOR;
    context.textAlign="end";
    context.fillText(groupe[6], 765, 315);

    context.font = FONT_ESPECE;
    context.fillStyle = FONT_ESPECE_COLOR;
    context.textAlign="center";
    context.fillText(especes[4], 600, 355);

    // mammiferes

    context.beginPath();
    context.strokeStyle = RECT_BORDER;
    context.lineWidth = "2";
    context.rect(30,400,740,80);
    context.fillStyle = RECT_GROUPE3;
    context.fill();
    context.stroke(); 

    context.font = FONT_ATTRIBUTS;
    context.fillStyle = FONT_ATTRIBUTS_COLOR;
    context.textAlign="start";
    context.fillText(attributs[8], 35, 395);

    context.font = FONT_GROUPE;
    context.fillStyle = FONT_GROUPE_COLOR;
    context.textAlign="end";
    context.fillText(groupe[8], 765, 395);

    context.font = FONT_ESPECE;
    context.fillStyle = FONT_ESPECE_COLOR;
    context.textAlign="center";
    context.fillText(especes[7] + ", " + especes[8] + ", " + especes[9] + ", " + especes[10] + ", " + especes[11], 400, 450);

    // oiseaux

    context.beginPath();
    context.strokeStyle = RECT_BORDER;
    context.lineWidth = "2";
    context.rect(30,510,740,55);
    context.fillStyle = RECT_GROUPE3;
    context.fill();
    context.stroke(); 

    context.font = FONT_ATTRIBUTS;
    context.fillStyle = FONT_ATTRIBUTS_COLOR;
    context.textAlign="start";
    context.fillText(attributs[7], 35, 505);

    context.font = FONT_GROUPE;
    context.fillStyle = FONT_GROUPE_COLOR;
    context.textAlign="end";
    context.fillText(groupe[7], 765, 505);

    context.font = FONT_ESPECE;
    context.fillStyle = FONT_ESPECE_COLOR;
    context.textAlign="center";
    context.fillText(especes[5] + ", " + especes[6], 400, 545);
};