let chartData = [];
const initialChartData = [...chartData]; // Datos iniciales de la gráfica

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

// Obtiene el tipo de cambio actual del dólar en pesos chilenos
async function obtenerTipoCambioActual() {
    try {
        const response = await fetch('https://mindicador.cl/api/dolar/2022');
        const data = await response.json();
        console.log(data);
        return data.serie[0].valor;
    } catch (error) {
        throw new Error('Error al obtener el tipo de cambio del dólar');
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

    // Verifica si un número es negativo
    if (cantidad < 0) {
        alert('No se permiten números negativos. Vuelve a intentarlo.');
        return;
    }

    let endpoint;
    let simboloMoneda;
    switch (moneda) {
        case 'usd':
            endpoint = 'https://mindicador.cl/api/dolar/2022';
            simboloMoneda = '$';
            break;
        case 'eur':
            endpoint = 'https://mindicador.cl/api/euro/2022';
            simboloMoneda = '€';
            break;
        default:
            return;
    }

    try {
        const historialMoneda = await obtenerHistorialMoneda(endpoint);

        // Filtra los datos para el eje Y (valores entre 905 y 950)
        const datosEjeY = historialMoneda.serie.filter((dia) => dia.valor >= 905 && dia.valor <= 950);

        // Construye los datos para la gráfica
        const labels = [
            '2022-2-4',
            '2022-2-7',
            '2022-2-8',
            '2022-2-9',
            '2022-2-10',
            '2022-2-11',
            '2022-2-14',
            '2022-2-15',
            '2022-2-16',
            '2022-2-17'
        ];
        const data = datosEjeY.map((dia) => dia.valor);

        // Obtiene el tipo de cambio actual del dólar en pesos chilenos
        const tipoCambioDolar = await obtenerTipoCambioActual();

        // Realiza la conversión de pesos chilenos a dólares
        const resultado = cantidad / tipoCambioDolar;

        // Muestra el resultado en el div correspondiente, incluyendo el símbolo y la abreviación de la moneda
        resultadoDiv.textContent = `Resultado: ${simboloMoneda} ${resultado.toFixed(2)} ${moneda.toUpperCase()}`;

        // Actualiza los datos de la gráfica
        chartData = data;
        lineChart.data.labels = labels;
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

// __Código para la gráfica__
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
                beginAtZero: false,
            },
        },
    },
});


