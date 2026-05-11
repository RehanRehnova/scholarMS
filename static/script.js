/* ── NAV ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 30));
const ham = document.getElementById('ham');
const drawer = document.getElementById('drawer');
ham.addEventListener('click', () => { drawer.classList.toggle('open'); });
drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => drawer.classList.remove('open')));

/* ── HERO CANVAS ── */

/* ── REVEAL ── */
const ro = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); ro.unobserve(e.target); } });
},{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>ro.observe(el));

/* ── ATTENDANCE ── */
function tap(btn){
  const wrap = btn.closest('.att-btns');
  wrap.querySelectorAll('.att-btn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
}
function submitAtt(btn){
  btn.textContent='✅ Attendance Submitted';
  btn.style.background='var(--green)';
  setTimeout(()=>{ btn.textContent='Submit Attendance →'; btn.style.background=''; },2800);
}

/* ── EXAM CHIPS ── */
function chipToggle(c){ c.classList.toggle('on'); }
function runExam(btn){
  btn.textContent='⏳ Generating…'; btn.disabled=true;
  const bar=document.getElementById('eprog');
  let w=78;
  const iv=setInterval(()=>{ w=Math.min(w+2,100); bar.style.width=w+'%'; if(w>=100){ clearInterval(iv); btn.textContent='✅ All Exams Ready — Download'; btn.disabled=false; btn.style.background='var(--green)'; } },120);
}

/* ── DEMO FORM ── */
document.addEventListener('DOMContentLoaded', function() {
    const demoForm = document.getElementById('demoForm');
    if (!demoForm) return;

    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const formAlert = document.getElementById('formAlert');

    demoForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        formAlert.style.display = 'none';

        const formData = new FormData(demoForm);
        const data = Object.fromEntries(formData.entries());

        if (!data.full_name ||!data.school_name ||!data.phone ||!data.email) {
            showAlert('Please fill all required fields.', 'error');
            resetButton();
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showAlert('Please enter a valid email address.', 'error');
            resetButton();
            return;
        }

        try {
            const response = await fetch('/api/book-demo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showAlert('Success! We\'ll contact you within 2 business hours.', 'success');
                demoForm.reset(); 
                formAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                showAlert(result.error || 'Something went wrong. Please try again.', 'error');
            }

        } catch (error) {
            console.error('Form error:', error);
            showAlert('Network error. Please check your connection and try again.', 'error');
        } finally {
            resetButton();
        }
    });

    function showAlert(message, type) {
        formAlert.textContent = message;
        formAlert.style.display = 'block';

        if (type === 'success') {
            formAlert.style.background = 'var(--green-light)';
            formAlert.style.color = 'var(--green)';
            formAlert.style.border = '1px solid var(--green)';
        } else {
            formAlert.style.background = 'var(--rose-light)';
            formAlert.style.color = 'var(--rose)';
            formAlert.style.border = '1px solid var(--rose)';
        }
    }

    function resetButton() {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
});

/* ── CHARTS ── */
Chart.defaults.font.family="'Instrument Sans', sans-serif";
Chart.defaults.color='#9098b1';

new Chart(document.getElementById('pieC'),{
  type:'doughnut',
  data:{
    labels:['Paid','Pending','Overdue'],
    datasets:[{data:[68,22,10],backgroundColor:['#0d7a55','#c4780a','#c41843'],borderWidth:0,hoverOffset:6}]
  },
  options:{ cutout:'68%', plugins:{legend:{position:'bottom',labels:{padding:18,usePointStyle:true,font:{size:12}}}}, animation:{duration:1400} }
});

new Chart(document.getElementById('barC'),{
  type:'bar',
  data:{
    labels:['Gr 6','Gr 7','Gr 8','Gr 9','Gr 10'],
    datasets:[{label:'Attendance %',data:[94,91,96,88,93],backgroundColor:['#1847d4','#2d5aee','#1038b8','#4f76f0','#1847d4'],borderRadius:7,borderSkipped:false}]
  },
  options:{ scales:{y:{min:78,max:100,grid:{color:'#f0efe9'},ticks:{callback:v=>v+'%'}},x:{grid:{display:false}}}, plugins:{legend:{display:false}}, animation:{duration:1400} }
});

new Chart(document.getElementById('lineC'),{
  type:'line',
  data:{
    labels:['Dec','Jan','Feb','Mar','Apr','May'],
    datasets:[{label:'Avg Score',data:[74,78,75,82,85,87],borderColor:'#1847d4',backgroundColor:'rgba(24,71,212,.07)',fill:true,tension:.45,pointBackgroundColor:'#1847d4',pointRadius:5,pointHoverRadius:7}]
  },
  options:{ scales:{y:{min:60,max:100,grid:{color:'#f0efe9'},ticks:{callback:v=>v+'%'}},x:{grid:{display:false}}}, plugins:{legend:{display:false}}, animation:{duration:1400} }
});

/* ── Video Player ── */

document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.getElementById('demoVideoWrapper');
  const video = document.getElementById('demoVideo');
  const playBtn = document.getElementById('videoPlayBtn');
  const playIcon = playBtn.querySelector('.play-icon');
  const pauseIcon = playBtn.querySelector('.pause-icon');
  
  if (!video || !wrapper) return;
  
  // Initial state
  wrapper.classList.add('paused');
  
  function togglePlay() {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }
  
  // Click handlers
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });
  
  wrapper.addEventListener('click', togglePlay);
  
  // Update UI on play/pause
  video.addEventListener('play', () => {
    wrapper.classList.remove('paused');
    wrapper.classList.add('playing');
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  });
  
  video.addEventListener('pause', () => {
    wrapper.classList.remove('playing');
    wrapper.classList.add('paused');
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  });
  
  video.addEventListener('ended', () => {
    wrapper.classList.remove('playing');
    wrapper.classList.add('paused');
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  });
});