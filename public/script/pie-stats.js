// Variables utilisées pour TOUS les graph (dans l'ordre)

var TOTAL_VOTE = 39,                              
    RESULTATS = [32, 7, 0, 21, 14, 4, 37, 2],
    BACKGROUND = ["#3366cc","#dc3912","#ff9900","#109618"],
    BACKGROUND_FULL = [BACKGROUND[0], BACKGROUND[1], BACKGROUND[2], BACKGROUND[3]];

// Pie 1
var canvas1 = document.getElementById("pieChart1");
var ctx1 = document.getElementById("pieChart1").getContext("2d");
var pieChart1 = parseInt(new Chart(ctx1, {
    type: 'pie',
    data: {
        datasets: [
            {
                data: [
                    (Math.floor((RESULTATS[0]/TOTAL_VOTE)*1000))/10, 
                    (Math.floor((RESULTATS[1]/TOTAL_VOTE)*1000))/10
                    ],
                // Pourquoi ne pas utiliser une boucle de style (Math.floor((RESULTATS[i]/TOTAL_VOTE)*1000))/10 avec i++ ?
                backgroundColor: BACKGROUND_FULL,
                hoverBackgroundColor: BACKGROUND_FULL,
            }],
        labels: [
            "Oui (" + (Math.floor((RESULTATS[0]/TOTAL_VOTE)*1000))/10 + "%)", 
            "Non (" + (Math.floor((RESULTATS[1]/TOTAL_VOTE)*1000))/10 + "%)"
            ],       
    },
    options: {
        title: {
            display: true,
            text: 'Pensez-vous que l\'école doit se numériser d\'avantage ?',
        },
        animation: {
            responsive: false,
            maintainRatio: true,
            animateScale:true,
        }
    }
}));


// Pie 2
var canvas2 = document.getElementById("pieChart2");
var ctx2 = document.getElementById("pieChart2").getContext("2d");
var pieChart2 = new Chart(ctx2, {
    type: 'pie',
    data: {
        labels: [
            "Ni l'un, ni l'autre (" + (Math.floor((RESULTATS[2]/TOTAL_VOTE)*1000))/10 + "%)",
            "Intéressante (" + (Math.floor((RESULTATS[3]/TOTAL_VOTE)*1000))/10 + "%)", 
            "Pertinente (" + (Math.floor((RESULTATS[4]/TOTAL_VOTE)*1000))/10 + "%)", 
            "Les deux (" + (Math.floor((RESULTATS[5]/TOTAL_VOTE)*1000))/10 + "%)"
            ],
        datasets: [
            {
                data: [
                    (Math.floor((RESULTATS[2]/TOTAL_VOTE)*1000))/10, 
                    (Math.floor((RESULTATS[3]/TOTAL_VOTE)*1000))/10, 
                    (Math.floor((RESULTATS[4]/TOTAL_VOTE)*1000))/10,
                    (Math.floor((RESULTATS[5]/TOTAL_VOTE)*1000))/10
                    ],
                    backgroundColor: BACKGROUND_FULL,
                    hoverBackgroundColor: BACKGROUND_FULL,
            }]
    },
    options: {
        title: {
            display: true,
            text: 'Vous avez trouvé l\'idée de départ :',
        },
        animation: {
            responsive: false,
            maintainRatio: true,
            animateScale:true,
        }
    }
});

// Pie 3
var canvas3 = document.getElementById("pieChart3");
var ctx3 = document.getElementById("pieChart3").getContext("2d");
var pieChart3 = parseInt(new Chart(ctx3, {
    type: 'pie',
    data: {
        datasets: [
            {
                data: [
                    (Math.floor((RESULTATS[6]/TOTAL_VOTE)*1000))/10, 
                    (Math.floor((RESULTATS[7]/TOTAL_VOTE)*1000))/10
                    ],
                // Pourquoi ne pas utiliser une boucle de style (Math.floor((RESULTATS[i]/TOTAL_VOTE)*1000))/10 avec i++ ?
                backgroundColor: BACKGROUND_FULL,
                hoverBackgroundColor: BACKGROUND_FULL,
            }],
        labels: [
            "Oui (" + (Math.floor((RESULTATS[6]/TOTAL_VOTE)*1000))/10 + "%)", 
            "Non (" + (Math.floor((RESULTATS[7]/TOTAL_VOTE)*1000))/10 + "%)"
            ],       
    },
    options: {
        title: {
            display: true,
            text: 'Peut-on véhiculer des savoirs par le biais de jeu vidéo ?',
        },
        animation: {
            responsive: false,
            maintainRatio: true,
            animateScale:true,
        }
    }
}));