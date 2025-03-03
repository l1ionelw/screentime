export function convertToChartData(calculatedData) {
    let labels = []
    let data = []
    let paths = []
    for (let times of calculatedData) {
        if (times.app.length == 0) {
            times.app = times.path.split('\\').pop()
        }
        labels.push(times.app)
        data.push(times.usage)
        paths.push(times.path)
    }
    return {
        labels: labels,
        data: data,
        paths: paths
    }
}
