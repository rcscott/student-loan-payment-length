var app = new Vue({
  el: '#app',

  data: {
    loanAmount: 15000,
    interestRate: 4.50,
    monthlyPaymentMin: 500,
    monthlyPaymentMax: 2000,
    paymentIncrement: 100,
    paymentsData: [],
    chart: null,
  },

  mounted: function () {
    this.calculatePayments();
  },

  watch: {
    paymentsData: function (newPaymentsData) {
      let chartLabels = _.map(newPaymentsData, function (p) { return `$${p.monthlyPayment}`; });
      let chartData = _.map(newPaymentsData, 'numberOfPayments');

      if (_.isNull(this.chart)) {
        this.chart = new Chart($('#chart'), {
          type: 'bar',
          data: {
            labels: chartLabels,
            datasets: [{
              label: '# of Months',
              data: chartData,
              backgroundColor: '#17a2b8',
            }],
          },
          options: {
            title: {
              display: true,
              text: 'Monthly Payment Amount vs. Number of Months',
            },
            legend: { display: false },
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true,
                },
              }],
              xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Monthly Payment Amount',
                },
              }],
            },
          },
        });
      } else {
        this.chart.data.labels = chartLabels;
        this.chart.data.datasets[0].data = chartData;
        this.chart.update();
      }
    },
  },

  methods: {
    calculatePayments: function () {
      let paymentRange = _.range(
        this.monthlyPaymentMin, this.monthlyPaymentMax + this.paymentIncrement, this.paymentIncrement);

      this.paymentsData = _.map(paymentRange, function (paymentAmount) {
        let loanBalance = this.loanAmount;
        let monthlyInterestRate = this.interestRate / 100 / 12;
        let paymentCount = 0;
        let finalPayment;

        while (loanBalance > 0) {
          paymentCount += 1;
          loanBalance = loanBalance + (loanBalance * monthlyInterestRate);

          if (paymentAmount > loanBalance) {
            finalPayment = loanBalance;
          }

          loanBalance -= paymentAmount;
        }

        const payoffYears = Math.floor(paymentCount / 12);
        const payoffMonths = paymentCount % 12;

        return {
          monthlyPayment: paymentAmount,
          numberOfPayments: paymentCount,
          payoffYears: payoffYears,
          payoffMonths: payoffMonths,
          finalPayment: _.round(finalPayment, 2)};
      }.bind(this));
    },
  },
});
