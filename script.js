/*
 * Guide pour l'élaboration d'un script afin d'implémenter un algorithme de classification avec Brain.js
 */

const brain = require('brain.js');
// => Cf. https://github.com/BrainJS/brain.js

// Si CSV en local :
// const readline = require('readline');
// const fs = require('fs');
// => Cf. https://nodejs.org/api/readline.html

// Si CSV via une URL :
const axios = require('axios');
// => Cf. https://github.com/axios/axios/

const csvUrl = "https://gist.githubusercontent.com/cbouvard/2f334a970cf543a507526bdca7d1cae4/raw/d535262ceea8fe71e4915b682ca01dc5e6d750f1/iris.csv";

/**
 * Récupère les données CSV à partir d'un fichier local ou d'une URL (à choisir pour le TP)
 * @param urlOrFilename
 * @returns csvData
 */
async function getCsvData(urlOrFilename) {
    const csvData = await axios.get(urlOrFilename, {responseType: 'blob'});
    return csvData.data;
}

/**
 * Traite les données  CSV pour avoir des données sous forme de tableau JavaScript
 * @param csvData
 * @returns array rawData
 */
function parseCsv(csvData) {

    let rows = csvData.split("\n").slice(1);
    let rawData = [];

    rows.forEach(e => {
        let element = e.split(",");
        rawData.push(element)
    })
    return rawData;
}

/**
 * Prépare le jeu de données d'entraînement au format Brain.js
 * @param rawData
 * @returns array trainingData
 */
function prepareTrainingData(rawData) {
    let trainingData = [];

    rawData.forEach(element => {
        switch (element[4]){
            case 'Setosa':
                element[4] = [1,0,0];
                break;
            case 'Versicolor':
                element[4] = [0,1,0];
                break;
            case 'Virginica':
                element[4] = [0,0,1];
                break;
        }

        let input = [parseFloat(element[0]), parseFloat(element[1]), parseFloat(element[2]), parseFloat(element[3])];
        let output = element[4];

        trainingData.push({input: input, output: output});
    })
    return trainingData;
}


/**
 * Fonction principale du script
 */
async function main() {
    // Appeler getCsvData
    const csvData = await getCsvData(csvUrl);

    // Appeler parseCsv
    const rawData = parseCsv(csvData);

    // Appeler prepareTrainingData
    const trainingData = prepareTrainingData(rawData);

    // Créer un NeuralNetwork de Brain.js
    let neuralNetwork = new brain.NeuralNetwork({
        binaryThresh: 0.5,
        hiddenLayers: [3, 3, 2],
        activation: "sigmoid",
    });

    // Entraîner le modèle (fonction train)
    neuralNetwork.train(trainingData, {
        iterations: 100000,
        learningRate: 0.3,
    });

    // Résultats attendus : Setosa, Versicolor, Virginica
    let inputs = [[5.1, 3.5, 1.4,.2], [7,3.2,4.7,1.4], [6.3,3.3,6,2.5]];

    inputs.forEach(input => {
        console.log("Tableau en entrée : " + input + "\n");
        // Tester avec le lancement de prédiction (fonction run)
        let result = neuralNetwork.run(input);
        // Astuce : la fonction run renvoie un tableau typé. Pour obtenir un tableau classique, utiliser la fonction Array.from
        result = Array.from(result);

        console.log("Setosa : " + parseInt(result[0] * 100) + "%")
        console.log("Versicolor : " + parseInt(result[1] * 100) + "%")
        console.log("Virginica : " + parseInt(result[2] * 100) + "% \n")
    })
}

main();

