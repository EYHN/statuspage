const mainElement = document.getElementById('statuspage-main');
const shadowElement = document.getElementById('shadow');

function easeInOutQuad(t, b, c) {
  if (t === 1 || b === c) { return c; }
  c -= b;
  t /= 1 / 2;
  if ((t) < 1) { return c / 2 * t * t + b; }
  return -c / 2 * ((--t) * (t - 2) - 1) + b;
}

function scrollToTop(element, d) {
  const start = element.scrollTop;
  const startTime = Date.now();
  function animation() {
    const scrollTop = easeInOutQuad((Date.now() - startTime) / d, start, 0);
    if (scrollTop < 1) {
      element.scrollTop = 0;
    } else {
      element.scrollTop = scrollTop;
      requestAnimationFrame(animation);
    }
  }
  requestAnimationFrame(animation);
}

let lock = false;

Array.from(document.getElementsByClassName('statuspage-card')).forEach((element) => {
  const closeButton = element.getElementsByClassName('statuspage-card-close-icon')[0];
  const maskElement = element.getElementsByClassName('statuspage-card-mask')[0];
  const maskUnactiveElement = element.getElementsByClassName('statuspage-card-mask-unactive')[0]
  const maskActivedElement = element.getElementsByClassName('statuspage-card-mask-actived')[0]
  function maskBgUnactive() {
    maskElement.style.height = maskUnactiveElement.clientHeight + 'px';
  }
  function maskBgActived() {
    maskElement.style.height = maskActivedElement.clientHeight + 'px';
  }

  const maskAnimation = !!maskElement && !!maskUnactiveElement && !!maskActivedElement

  element.addEventListener('click', () => {
    if (lock) return;
    lock = true;
    const pos = element.getBoundingClientRect();

    if (maskAnimation) {
      maskUnactiveElement.style.width = maskUnactiveElement.clientWidth + 'px';
      maskBgUnactive();
    }


    element.style.position = 'fixed';
    element.style.left = pos.left + 'px';
    element.style.top = pos.top + 'px';
    element.style.width = pos.width + 'px';
    element.style.height = pos.height + 'px';
    document.body.style.overflow = 'hidden';

    setTimeout(openAnimation, 50);

    function openAnimation() {
      element.style.position = '';
      element.style.left = '';
      element.style.top = '';
      element.style.width = '';
      element.style.height = '';
      element.id = 'active';
      if (maskAnimation) {
        maskBgActived();
      }

      shadowElement.classList.add('on');

      setTimeout(openAnimationEnd, 800);
    }

    function openAnimationEnd() {
      shadowElement.addEventListener('click', closeAnimation);
      closeButton.addEventListener('click', closeAnimation);
    }

    function closeAnimation() {
      scrollToTop(element, 700);
      shadowElement.classList.remove('on');
      shadowElement.removeEventListener('click', closeAnimation);
      closeButton.removeEventListener('click', closeAnimation);
      if (maskAnimation) {
        maskBgUnactive();
      }
      element.style.position = 'fixed';
      element.style.left = pos.left + 'px';
      element.style.top = pos.top + 'px';
      element.style.width = pos.width + 'px';
      element.style.height = pos.height + 'px';
      element.style.zIndex = 1000;
      element.id = '';
      setTimeout(closeAnimationEnd, 800);
    }

    function closeAnimationEnd() {
      document.body.style.overflow = 'auto';
      element.style.position = '';
      element.style.left = '';
      element.style.top = '';
      element.style.width = '';
      element.style.height = '';
      element.style.zIndex = '';
      if (maskAnimation) {
        maskUnactiveElement.style.width = '';
        maskElement.style.height = '';
      }
      lock = false;
    }
  });
})

function getMonitors(apikey, args) {
  const params = new URLSearchParams(Object.assign({},{
    'api_key': apikey,
    'format': 'json'
  }, args));

  return fetch('https://api.uptimerobot.com/v2/getMonitors', {
    method: 'POST',
    body: params,
    cache: 'no-cache',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.json())
}

const status_color_map = {
  0: '#000',
  1: '#666',
  2: '#4cd964',
  8: '#ffcc00',
  9: '#ff3b30'
}

const status_name_map = {
  0: 'Paused',
  1: 'Unknown',
  2: 'Up',
  8: 'Seems Down',
  9: 'Down'
}

const event_color_map = {
  1: '#ff3b30',
  2: '#4cd964',
  99: '#000',
  98: '#666'
}

const reason_code_detail_map = {
  "200": "正常",
  "98": "开始监控",
  "99": "暂停监控",
  "333333": "连接超时",
  "555555": "成功回应",
  "2": "超时",
};

const uptimeData = Array.from(document.querySelectorAll('.statuspage-monitor')).map(monitorElement => {
  const apikey = monitorElement.getAttribute('data-uptimerobot-apikey');
  const id = monitorElement.getAttribute('data-uptimerobot-monitorid');

  getMonitors(apikey, {
    'custom_uptime_ratios': 7,
    'response_times': 1,
    'logs': 1,
    'logs_limit': 5
  }).then(json => {
    if (json.stat === 'ok') {
      const monitor = json.monitors.find(monitor => monitor.id == id);

      if (monitor) {
        Array.from(monitorElement.querySelectorAll('.statuspage-card-mask-status')).forEach(elem => {
          elem.querySelector('.statuspage-status-circle').style.backgroundColor = status_color_map[monitor.status];
          elem.querySelector('.statuspage-status-text').style.color = status_color_map[monitor.status];
          elem.querySelector('.statuspage-status-text').innerText = status_name_map[monitor.status];
        });

        Array.from(monitorElement.querySelectorAll('.statuspage-status-table>tbody>tr')).forEach(tr => {
          tr.querySelector('.statuspage-status-circle').style.backgroundColor = status_color_map[monitor.status];
          tr.querySelector('.statuspage-status-text').style.color = status_color_map[monitor.status];
          tr.querySelector('.statuspage-status-text').innerText = status_name_map[monitor.status];
          tr.querySelector('.statuspage-status-ratio').style.color = status_color_map[monitor.status];
          tr.querySelector('.statuspage-status-ratio').innerText = parseFloat(monitor.custom_uptime_ratio).toFixed(2) + '%'
        });

        Array.from(monitorElement.querySelectorAll('.statuspage-plot')).forEach(plot => {
          const data = monitor.response_times.map(({ datetime, value }) => ({ datetime: datetime * 1000, value }));
          const margin = ({ top: 10, right: 30, bottom: 15, left: 10 });
          const height = 250;
          const width = 500;

          const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)]).nice()
            .range([height - margin.bottom, margin.top]);

          const start = Date.now() - 60 * 60 * 24 * 1000;
          let end = Date.now();
          if (Math.abs(d3.max(data, d => d.datetime) - end) < 60 * 60 * 1000) {
            end = d3.max(data, d => d.datetime);
          }

          const x = d3.scaleTime()
            .domain([start, end])
            .range([margin.left, width - margin.right]);

          const area = d3.area()
            .x(d => x(d.datetime))
            .y0(y(0))
            .y1(d => y(d.value));

          const line = d3.line()
            .defined(d => !isNaN(d.value))
            .x(d => x(d.datetime))
            .y(d => y(d.value))

          const yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisRight(y).ticks(5).tickSize(width - margin.right - margin.left))
            .call(g => g.selectAll(".tick line").attr('stroke', 'rgba(0,0,0,.1)'))
            .call(g => g.selectAll(".tick text").attr('color', '#666'))
            .call(g => g.select(".domain").remove())
            .call(g =>
              g.select(".tick:last-of-type text").clone()
                .attr("dx", -3)
                .attr("text-anchor", "end")
                .text('时间 (ms)')
            )

          const xAxis = g => g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(5).tickSize(- height + margin.top + margin.bottom).tickSizeOuter(0))
            .call(g => g.selectAll(".tick line").attr('stroke', 'rgba(0,0,0,.1)'))
            .call(g => g.selectAll(".tick text").attr('color', '#666').attr('style', 'transform: translateY(2px);'))
            .call(g => g.select(".domain").attr('stroke', '#888'));

          const svg = d3.select(plot)
            .attr("viewBox", `0 0 ${width} ${height}`)

          const defs = svg.append("defs");

          const gradient = defs.append("linearGradient")
            .attr("id", "svgGradient")
            .attr("x1", "50%")
            .attr("x2", "50%")
            .attr("y1", "100%")
            .attr("y2", "0%");

          gradient.append("stop")
            .attr('class', 'start')
            .attr("offset", "0%")
            .attr("stop-color", "rgb(76, 217, 100)")
            .attr("stop-opacity", 0);

          gradient.append("stop")
            .attr('class', 'end')
            .attr("offset", "100%")
            .attr("stop-color", "rgb(76, 217, 100)")
            .attr("stop-opacity", .6);

          svg.append("g")
            .call(xAxis);

          svg.append("g")
            .call(yAxis);

          svg.append("path")
            .datum(data)
            .attr("fill", "url(#svgGradient)")
            .attr("d", area);

          svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "rgb(76, 217, 100)")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", line);
        });

        Array.from(monitorElement.querySelectorAll('.statuspage-events-table')).forEach(table => {
          table.innerHTML += monitor.logs.map((event) => {
            const date = new Date(event.datetime * 1000);
            return `
            <tr>
              <td>
                <span class="statuspage-event-circle" style="background-color:${event_color_map[event.type]}"></span>
                <span class="statuspage-event-text" style="color:${event_color_map[event.type]}">${reason_code_detail_map[event.reason.code] || event.reason.detail}</span>
              </td>
              <td><span class="statuspage-event-time">${date.getFullYear()}年${date.getMonth()}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}</td>
              <td><span class="statuspage-event-duration">${Math.floor(event.duration / 60 / 60)}小时，${Math.round(event.duration % 60 % 60)}分钟</td>
            </tr>
            `
          }).join('');
        });
      }
    }
  });
});
