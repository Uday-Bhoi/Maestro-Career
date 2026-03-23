import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { scores, primaryQuadrant, secondaryQuadrant } = data;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Maestro Career Report</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; color: #333; }
          .page { width: 100%; height: 1100px; padding: 60px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; position: relative; page-break-after: always; }
          .bg-primary { background-color: #1294DD; color: white; }
          .header { font-size: 32px; font-weight: 800; margin-bottom: 20px; color: #1294DD; border-bottom: 3px solid #1294DD; padding-bottom: 10px; }
          .cover { align-items: center; text-align: center; }
          .title { font-size: 56px; font-weight: 800; margin-bottom: 10px; color: white; }
          .subtitle { font-size: 24px; color: #e0e0e0; }
          .section { margin-top: 30px; }
          .section h2 { font-size: 24px; color: #1294DD; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; }
          .card { background: #f9f9f9; padding: 30px; border-radius: 8px; border-left: 6px solid #1294DD; }
          p { font-size: 18px; line-height: 1.6; }
          .footer { position: absolute; bottom: 30px; left: 60px; right: 60px; font-size: 14px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
          .chart-container { width: 100%; max-width: 600px; margin: 40px auto; height: 350px; }
        </style>
      </head>
      <body>
        <!-- Page 1: Cover -->
        <div class="page cover bg-primary">
          <h1 class="title">Maestro Career</h1>
          <p class="subtitle">Complete Psychometric & Aptitude Report</p>
          <div style="margin-top: 60px; font-size: 22px;">
            <p style="margin-bottom: 5px; color: white;">Prepared for: <strong>Demo User</strong></p>
            <p style="margin-top: 0; color: rgba(255,255,255,0.8);">Date: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <!-- Page 2: Assessment Summary -->
        <div class="page">
          <div class="header">1. Assessment Overview</div>
          <p>
            The Maestro Career Assessment combines rigorous psychometric profiling with aptitude evaluation to pinpoint your natural strengths and cognitive inclinations. 
            By analyzing your responses across a 60-second timed environment, we have categorized your tendencies into four major quadrants:
            <strong>Healthcare, Engineering, Law, and Design.</strong>
          </p>
          <div class="card section">
            <h2>Methodology</h2>
            <p>12 tailored questions mapping into key professional vectors, analyzing problem solving, logic, and emotional intelligence under pressure.</p>
          </div>
          <div class="footer">Maestro Career &copy; ${new Date().getFullYear()}</div>
        </div>

        <!-- Page 3: Score Breakdown -->
        <div class="page">
          <div class="header">2. Score Breakdown</div>
          <div class="grid" style="margin-top: 40px;">
            <div class="card">
              <h2>Doctor (Healthcare)</h2>
              <p style="font-size: 32px; font-weight: bold; margin: 10px 0;">${scores.Doctor} Points</p>
              <p style="font-size: 14px; color: #666;">Measures compassion and analytical grace.</p>
            </div>
            <div class="card" style="border-left-color: #10B981;">
              <h2>Engineer (Tech)</h2>
              <p style="font-size: 32px; font-weight: bold; margin: 10px 0;">${scores.Engineer} Points</p>
              <p style="font-size: 14px; color: #666;">Measures logical systems thinking.</p>
            </div>
            <div class="card" style="border-left-color: #F59E0B;">
              <h2>Lawyer (Advocacy)</h2>
              <p style="font-size: 32px; font-weight: bold; margin: 10px 0;">${scores.Lawyer} Points</p>
              <p style="font-size: 14px; color: #666;">Measures negotiation and critical reading.</p>
            </div>
            <div class="card" style="border-left-color: #8B5CF6;">
              <h2>Artist (Design)</h2>
              <p style="font-size: 32px; font-weight: bold; margin: 10px 0;">${scores.Artist} Points</p>
              <p style="font-size: 14px; color: #666;">Measures creative and visual problem solving.</p>
            </div>
          </div>
          <div class="footer">Maestro Career &copy; ${new Date().getFullYear()}</div>
        </div>

        <!-- Page 4: Visual Data -->
        <div class="page">
          <div class="header">3. Aptitude Distribution</div>
          <p>Visual breakdown of your cognitive alignment across all four major quadrants.</p>
          <div class="chart-container">
            <canvas id="barChart"></canvas>
          </div>
          <div class="chart-container" style="height: 300px;">
            <canvas id="pieChart"></canvas>
          </div>
          <div class="footer">Maestro Career &copy; ${new Date().getFullYear()}</div>
        </div>

        <!-- Page 5: Best Suited Career Path -->
        <div class="page">
          <div class="header">4. Primary Recommendation</div>
          <p style="font-size: 24px;">Your highest scoring domain is:</p>
          <h1 style="font-size: 56px; color: #1294DD; margin: 20px 0;">${primaryQuadrant} Path</h1>
          <p>
            Your responses indicate a powerful alignment with this quadrant. 
            You exhibit the core competencies required to succeed and find fulfillment here.
          </p>
          <div class="card section">
            <h2>Why this fits you</h2>
            <p>Your problem-solving approach and time-management under pressure match the typical profile of top performers in this field. You naturally apply the required mental models seamlessly.</p>
          </div>
          <div class="footer">Maestro Career &copy; ${new Date().getFullYear()}</div>
        </div>

        <!-- Page 6: Secondary Recommendations -->
        <div class="page">
          <div class="header">5. Secondary Strengths</div>
          <p style="font-size: 24px;">Your supporting domain is:</p>
          <h2 style="font-size: 40px; color: #555; margin: 20px 0;">${secondaryQuadrant} Path</h2>
          <p>
            Your secondary domain suggests versatility. You can often act as a bridge between your primary domain and this one, making you highly valuable in cross-functional roles. Integrating these two paths creates a unique, highly competitive professional profile.
          </p>
          <div class="footer">Maestro Career &copy; ${new Date().getFullYear()}</div>
        </div>

        <!-- Page 7: Conclusion -->
        <div class="page" style="text-align: center; justify-content: center; align-items: center;">
          <h2 style="color: #1294DD; font-size: 40px;">Professional Journey Ahead</h2>
          <p style="max-width: 600px; margin: 20px auto;">
            Knowledge without action is merely data. Leverage this report to target your upskilling, tailor your resume, and focus on roles that celebrate your natural inclinations.
          </p>
          <div style="margin-top: 50px; text-align: center; padding: 40px; background: #f0f8ff; border-radius: 12px; display: inline-block;">
            <h3 style="color: #1294DD; margin: 0; font-size: 28px;">Thank you for trusting Maestro Career.</h3>
          </div>
          <div class="footer">Maestro Career &copy; ${new Date().getFullYear()}</div>
        </div>

        <script>
          // Render charts
          Chart.defaults.animation = false; // Important for PDF generation
          
          const scores = {
            Doctor: ${scores.Doctor},
            Engineer: ${scores.Engineer},
            Lawyer: ${scores.Lawyer},
            Artist: ${scores.Artist}
          };

          const labels = ['Doctor', 'Engineer', 'Lawyer', 'Artist'];
          const data = [scores.Doctor, scores.Engineer, scores.Lawyer, scores.Artist];
          const colors = ['#1294DD', '#10B981', '#F59E0B', '#8B5CF6'];

          const ctxBar = document.getElementById('barChart').getContext('2d');
          new Chart(ctxBar, {
            type: 'bar',
            data: {
              labels: labels,
              datasets: [{
                label: 'Aptitude Points',
                data: data,
                backgroundColor: colors,
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
            }
          });

          const ctxPie = document.getElementById('pieChart').getContext('2d');
          new Chart(ctxPie, {
            type: 'doughnut',
            data: {
              labels: labels,
              datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'right' } }
            }
          });
        </script>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Maestro-Career-Report.pdf"',
      },
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
