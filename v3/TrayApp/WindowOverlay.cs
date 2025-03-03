using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace TrayApp
{
    public class WindowOverlay : Form1
    {
        public string currentText = "Welcome to screentime!";
        public WindowOverlay()
        {
            this.FormBorderStyle = FormBorderStyle.None;
            this.TopMost = true;
            this.StartPosition = FormStartPosition.Manual;

            // Set the window size to be small
            this.Size = new Size(300, 50); // Adjust size as needed
            this.BackColor = Color.Black;
            this.TransparencyKey = Color.Black; // Makes the black color transparent
            this.Opacity = 1; // Optional: Make the overlay semi-transparent

            // Position the window at the bottom-right corner
            var screen = Screen.PrimaryScreen.WorkingArea;
            this.Location = new Point(screen.Width - this.Width - 10, screen.Height - this.Height - 10); // 10px margin from the edges
            // MakeWindowVisibleOnAllDesktops();
        }
        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);

            // Draw the text from the `currentApp` variable
            using (Font font = new Font("Arial", 12, FontStyle.Bold)) // Smaller font
            using (Brush brush = new SolidBrush(Color.White))
            {
                e.Graphics.DrawString(currentText, font, brush, new PointF(10, 10)); // Adjust padding if needed
            }
        }
        public void UpdateText(string newText)
        {
            currentText = newText;
            this.Invalidate(); // Redraw the window
        }
        // Required for creating a transparent overlay
        [DllImport("user32.dll", SetLastError = true)]
        private static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);
        [DllImport("user32.dll", SetLastError = true)]
        private static extern int GetWindowLong(IntPtr hWnd, int nIndex);

        private const int WS_EX_LAYERED = 0x80000;
        private const int WS_EX_TRANSPARENT = 0x20;
        private const int GWL_EXSTYLE = 0x00080080;
        private const int WS_EX_TOOLWINDOW = 0x80;
        private const int WS_EX_NOACTIVATE = 0x8000000;
        protected override void OnShown(EventArgs e)
        {
            base.OnShown(e);

            // Make the overlay window click-through
            IntPtr hWnd = this.Handle;
            int exStyle = GetWindowLong(hWnd, GWL_EXSTYLE);
            SetWindowLong(hWnd, GWL_EXSTYLE, exStyle | WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE);
        }
    }
    }
