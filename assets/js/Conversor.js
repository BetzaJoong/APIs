let chartData = [905, 20, 15, 25, 30];
const initialChartData = [...chartData]; // Copia los datos iniciales de la gráfica

// Obtiene tipos de cambio desde mindicador.cl
async function obtenerTiposDeCambio() {
    try {
        const response = await fetch('https://mindicador.cl/api');
        const data = await response.json();
        console.log(data)
        return data;
    } catch (error) {
        throw new Error('Error al obtener los tipos de cambio');
    }
}

// Función para convertir la moneda
async function convertirMoneda() {
    const cantidadInput = document.getElementById('cantidad');
    const monedaSelect = document.getElementById('moneda');
    const resultadoDiv = document.getElementById('resultado');

    const cantidad = parseFloat(cantidadInput.value);
    const moneda = monedaSelect.value;

    // Verifica si los campos están vacíos
    if (!cantidad || moneda === 'select') {
        alert('Los campos están vacíos. Inténtalo de nuevo.');
        return;
    }

    try {
        const tiposDeCambio = await obtenerTiposDeCambio();

        // Realiza la lógica de conversión según la moneda seleccionada
        // Utiliza los valores de tiposDeCambio para obtener los factores de conversión
        let factorConversion;
        let monedaTexto; // Variable para almacenar el texto de la moneda seleccionada
        switch (moneda) {
            case 'usd':
                factorConversion = tiposDeCambio.dolar.valor;
                monedaTexto = 'USD';
                break;
            case 'eur':
                factorConversion = tiposDeCambio.euro.valor;
                monedaTexto = 'EUR';
                break;
            default:
                factorConversion = 1; // No se ha seleccionado una moneda válida, no se realiza la conversión
                monedaTexto = '';
                break;
        }

        const resultado = cantidad / factorConversion;

        // Muestra el resultado en el div correspondiente, incluyendo el texto de la moneda
        resultadoDiv.textContent = `Resultado: ${resultado.toFixed(2)} ${monedaTexto}`;

        chartData.shift(); // Elimina el primer elemento del array
        chartData.push(resultado); // Agrega el nuevo resultado al final del array
        lineChart.data.datasets[0].data = chartData;
        lineChart.update();
    } catch (error) {
        resultadoDiv.textContent = 'Error al realizar la conversión';
    }
}

// Agrega un event listener al botón para llamar a la función de conversión
const botonConvertir = document.getElementById('convertir');
botonConvertir.addEventListener('click', convertirMoneda);

// Reinicio
document.getElementById('reiniciar').addEventListener('click', function () {
    document.getElementById('cantidad').value = '';
    document.getElementById('moneda').selectedIndex = 0;
    document.getElementById('resultado').textContent = '';

    // Restablece los datos de la gráfica al valor inicial
    chartData = [...initialChartData];
    lineChart.data.datasets[0].data = chartData;
    lineChart.update();
});

// Código para la gráfica
const canvas = document.getElementById('lineChart');
const ctx = canvas.getContext('2d');
const data = {
    labels: ['2022 2-4', '2022 2-7', '2022 2-8', '2022 2-9', '2022 2-10', '2022 2-11', '2022 2-14', '2022 2-15', '2022 2-16', '2022 2-17'],
    datasets: [
        {
            label: 'Historial últimos 10 días',
            data: chartData,
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        },
    ],
};
const lineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    },
});





let myChart;

// Obtiene el historial de valores de una moneda desde la API de mindicador.cl
async function obtenerHistorialMoneda(tipoMoneda) {
    try {
        const response = await fetch(`https://mindicador.cl/api/${tipoMoneda}`);
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`Error al obtener el historial de ${tipoMoneda}`);
    }
}

// Obtiene los datos de los últimos 10 días para una moneda específica
function obtenerDatosUltimos10Dias(moneda) {
    const datos = moneda.serie.slice(-10); // Obtiene los últimos 10 elementos del array
    return datos.map((dato) => dato.valor);
}

// Función para preparar el objeto de configuración que requiere la librería Chart.js
function prepararConfiguracionParaLaGrafica(labels, datos) {
    const tipoDeGrafica = "line";
    const titulo = "Historial últimos 10 días";
    const colorDeLinea = 'rgba(75, 192, 192, 1)';

    const config = {
        type: tipoDeGrafica,
        data: {
            labels: labels,
            datasets: [
                {
                    label: titulo,
                    backgroundColor: colorDeLinea,
                    borderColor: colorDeLinea,
                    data: datos,
                    fill: false,
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    return config;
}

// Función para actualizar la gráfica con los datos más recientes de la API
async function actualizarGrafica() {
    try {
        const dolar = await obtenerHistorialMoneda('dolar');
        const datosDolar = obtenerDatosUltimos10Dias(dolar);

        myChart.data.datasets[0].data = datosDolar;
        myChart.update();
    } catch (error) {
        console.error(error);
    }
}

// Función para renderizar la gráfica y obtener los datos iniciales
async function renderGrafica() {
    try {
        const dolar = await obtenerHistorialMoneda('dolar');
        const datosDolar = obtenerDatosUltimos10Dias(dolar);

        const labels = dolar.serie.slice(-10).map((dato) => dato.fecha);

        const config = prepararConfiguracionParaLaGrafica(labels, datosDolar);
        const chartDOM = document.getElementById("lineChart");

        myChart = new Chart(chartDOM, config);

        setInterval(actualizarGrafica, 5000); // Actualiza la gráfica cada 5 segundos (puedes ajustar el intervalo según tus necesidades)
    } catch (error) {
        console.error(error);
    }
}

// Primera función a ejecutarse al cargar el programa
renderGrafica();
