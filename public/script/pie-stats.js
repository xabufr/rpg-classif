var TOTAL_VOTE = 38,                              
    RESULTATS = [31, 7, 20, 14, 4],
    BACKGROUND = ["rgba(194, 61, 255, 1)","rgba(69,224,211, 1)","#FFCE56"];

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
                backgroundColor: [BACKGROUND[0], BACKGROUND[1]],
                hoverBackgroundColor: [BACKGROUND[0], BACKGROUND[1]],
            }],
        labels: [
            "Oui (" + (Math.floor((RESULTATS[0]/TOTAL_VOTE)*1000))/10 + "%)", 
            "Non (" + (Math.floor((RESULTATS[1]/TOTAL_VOTE)*1000))/10 + "%)"
            ],       
    },
    options: {
        title: {
            display: true,
            text: 'L\'école doit-elle se numériser d\'avantage ?',
        },
        animation: {
            responsive: false,
            maintainRatio: true,
            animateScale:true,
        }
    }
}));

var canvas2 = document.getElementById("pieChart2");
var ctx2 = document.getElementById("pieChart2").getContext("2d");
var pieChart2 = new Chart(ctx2, {
    type: 'pie',
    data: {
        labels: [
            "Intéressante (" + (Math.floor((RESULTATS[2]/TOTAL_VOTE)*1000))/10 + "%)", 
            "Pertinente (" + (Math.floor((RESULTATS[3]/TOTAL_VOTE)*1000))/10 + "%)", 
            "Les deux (" + (Math.floor((RESULTATS[4]/TOTAL_VOTE)*1000))/10 + "%)"
            ],
        datasets: [
            {
                data: [
                    (Math.floor((RESULTATS[2]/TOTAL_VOTE)*1000))/10, 
                    (Math.floor((RESULTATS[3]/TOTAL_VOTE)*1000))/10, 
                    (Math.floor((RESULTATS[4]/TOTAL_VOTE)*1000))/10
                    ],
                backgroundColor: ["rgba(194, 61, 255, 1)","#36A2EB","#FFCE56"],
                hoverBackgroundColor: ["rgba(194, 61, 255, 1)","#36A2EB","#FFCE56"],
            }]
    },
    options: {
        title: {
            display: true,
            text: 'Trouvez-vous l\'idée de départ :',
        },
        animation: {
            responsive: false,
            maintainRatio: true,
            animateScale:true,
        }
    }
});