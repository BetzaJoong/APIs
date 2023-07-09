let chartData = [];
const initialChartData = [...chartData]; //___Datos iniciales de la gráfica___

// Obtiene el historial de valores de la moneda desde mindicador.cl
async function obtenerHistorialMoneda(endpoint) {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        throw new Error('Error al obtener el historial de la moneda');
    }
}

//____Función para convertir la moneda____
async function convertirMoneda() {
    const cantidadInput = document.getElementById('cantidad');
    const monedaSelect = document.getElementById('moneda');
    const resultadoDiv = document.getElementById('resultado');

    const cantidad = parseFloat(cantidadInput.value);
    const moneda = monedaSelect.value;

    //___Verifica si los campos están vacíos____
    if (!cantidad || moneda === 'select') {
        alert('Los campos están vacíos. Inténtalo de nuevo.');
        return;
    }

    //____Verifica si un número es negativo____
    if (cantidad < 0) {
        alert('No se permiten números negativos. Vuelve a intentarlo.');
        return;
    }

    let endpoint;
    let simboloMoneda;
    switch (moneda) {
        case 'usd':
            endpoint = 'https://mindicador.cl/api/dolar';
            simboloMoneda = '$';
            break;
        case 'eur':
            endpoint = 'https://mindicador.cl/api/euro';
            simboloMoneda = '€';
            break;
        default:
            alert('Moneda no válida. Selecciona USD o EUR.');
            return;
    }

    try {
        const historialMoneda = await obtenerHistorialMoneda(endpoint);

        //___Obtiene los últimos 10 días del historial___
        const ultimos10Dias = historialMoneda.serie.slice(-10);

        //___Construye los datos para la gráfica___
        const labels = ultimos10Dias.map((dia) => dia.fecha);
        const data = ultimos10Dias.map((dia) => dia.valor);

        //___Muestra el resultado en el div correspondiente, incluyendo el símbolo y la abreviación de la moneda___
        resultadoDiv.textContent = `Resultado: ${simboloMoneda} ${data[9].toFixed(2)} ${moneda.toUpperCase()}`;

        //___Actualiza los datos de la gráfica___
        chartData = data;
        lineChart.data.labels = labels;
        lineChart.data.datasets[0].data = chartData;
        lineChart.update();
    } catch (error) {
        resultadoDiv.textContent = 'Error al obtener el historial de la moneda';
    }
}

//__Agrega un event listener al botón para llamar a la función de conversión__
const botonConvertir = document.getElementById('convertir');
botonConvertir.addEventListener('click', convertirMoneda);

//___Reinicio__
document.getElementById('reiniciar').addEventListener('click', function () {
    document.getElementById('cantidad').value = '';
    document.getElementById('moneda').selectedIndex = 0;
    document.getElementById('resultado').textContent = '';

    //___Restablece los datos de la gráfica al valor inicial___
    chartData = [...initialChartData];
    lineChart.data.datasets[0].data = chartData;
    lineChart.update();
});

//___Código para la gráfica___
const canvas = document.getElementById('lineChart');
const ctx = canvas.getContext('2d');
const data = {
    labels: [],
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
