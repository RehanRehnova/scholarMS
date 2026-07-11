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

class VideoPlayer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.video = this.container.querySelector('.video-element');
    this.playPauseBtn = this.container.querySelector('#playPauseBtn');
    this.bigPlayBtn = this.container.querySelector('#bigPlayBtn');
    this.muteBtn = this.container.querySelector('#muteBtn');
    this.volumeSlider = this.container.querySelector('#volumeSlider');
    this.fullscreenBtn = this.container.querySelector('#fullscreenBtn');
    this.progressBar = this.container.querySelector('#progressBar');
    this.progressFilled = this.container.querySelector('#progressFilled');
    this.currentTimeEl = this.container.querySelector('#currentTime');
    this.durationEl = this.container.querySelector('#duration');
    
    this.isDragging = false;
    this.init();
  }
  
  init() {
    this.container.classList.add('paused');
    
    // Event listeners
    this.playPauseBtn.addEventListener('click', () => this.togglePlay());
    this.bigPlayBtn.addEventListener('click', () => this.togglePlay());
    this.video.addEventListener('click', () => this.togglePlay());
    this.muteBtn.addEventListener('click', () => this.toggleMute());
    this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
    this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    
    this.video.addEventListener('timeupdate', () => this.updateProgress());
    this.video.addEventListener('loadedmetadata', () => this.updateDuration());
    this.video.addEventListener('play', () => this.onPlay());
    this.video.addEventListener('pause', () => this.onPause());
    this.video.addEventListener('ended', () => this.onPause());
    
    // Progress bar seeking
    this.progressBar.addEventListener('click', (e) => this.seek(e));
    this.progressBar.addEventListener('mousedown', () => this.isDragging = true);
    document.addEventListener('mouseup', () => this.isDragging = false);
    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) this.seek(e);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (document.activeElement.tagName === 'INPUT') return;
      if (e.code === 'Space' && this.isInViewport()) {
        e.preventDefault();
        this.togglePlay();
      }
    });
  }
  
  togglePlay() {
    if (this.video.paused) {
      this.video.play();
    } else {
      this.video.pause();
    }
  }
  
  onPlay() {
    this.container.classList.remove('paused');
    this.container.classList.add('playing');
    this.playPauseBtn.querySelector('.icon-play').style.display = 'none';
    this.playPauseBtn.querySelector('.icon-pause').style.display = 'block';
  }
  
  onPause() {
    this.container.classList.remove('playing');
    this.container.classList.add('paused');
    this.playPauseBtn.querySelector('.icon-play').style.display = 'block';
    this.playPauseBtn.querySelector('.icon-pause').style.display = 'none';
  }
  
  toggleMute() {
    this.video.muted = !this.video.muted;
    this.muteBtn.querySelector('.icon-volume').style.display = this.video.muted ? 'none' : 'block';
    this.muteBtn.querySelector('.icon-mute').style.display = this.video.muted ? 'block' : 'none';
  }
  
  setVolume(value) {
    this.video.volume = value;
    this.video.muted = value == 0;
    this.toggleMute();
    this.toggleMute(); // update icon
  }
  
  updateProgress() {
    const percent = (this.video.currentTime / this.video.duration) * 100;
    this.progressFilled.style.width = `${percent}%`;
    this.currentTimeEl.textContent = this.formatTime(this.video.currentTime);
  }
  
  updateDuration() {
    this.durationEl.textContent = this.formatTime(this.video.duration);
  }
  
  seek(e) {
    const rect = this.progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    this.video.currentTime = percent * this.video.duration;
  }
  
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
  
  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  isInViewport() {
    const rect = this.container.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  new VideoPlayer('scholarVideoPlayer');
});
