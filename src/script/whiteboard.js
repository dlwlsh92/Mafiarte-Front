export class Whiteboard {
    /**
     * Constructor
     *
     * @param {HTMLElement} canvas          The canvas element
     * @param {socket} socket               The socket.io socket
     * @param {string} name                 The name(id)
     * @param {string} [color='#4d4d4d']    The default color
     * @param {number} [thickness=4]        The default thickness
     */
    constructor(canvas, socket, roomName, color = '#4d4d4d', thickness = 4) {
      // Define read-only properties
      Object.defineProperties(this, {
        thicknessMin: { value: 1 },
        thicknessMax: { value: 120 },
        socketEvents: {
          value: {
            DRAW: 'DRAW',
            DRAW_BEGIN_PATH: 'DRAW_BEGIN_PATH',
          },
        },
      });
  
      this.canvas = canvas;
      this.socket = socket;
      this.name = roomName;
      this.color = color;
      this.thickness = thickness;
  
      this.ctx = this.canvas.getContext('2d');
  
      canvas.addEventListener('mousedown', () => {
        this.socket.emit(this.socketEvents.DRAW_BEGIN_PATH);
      });
  
      canvas.addEventListener('mousemove', (e) => {
        // Check whether we're holding the left click down while moving the mouse
        let today = new Date();

        this._emitDrawingData(e);
        // if (e.buttons === 1) { // 왼쪽 버튼 눌렀을 때
        //   if (today.getMilliseconds() % 7 != 0) {
        //     this._emitDrawingData(e);
        //   }
        // }
      
      });

      canvas.addEventListener('click', (e) => {
        this._emitDrawingData(e);
      });
  
      this._resizeCanvas();
  
      const self = this;
      window.addEventListener('resize', () => self._resizeCanvas());
  
      this.socket.on(this.socketEvents.DRAW, (data) => self._socketDraw(data));
    }
  
    /**
     * Resize the canvas, so its width and height
     * attributes are the same as the offsetWidth
     * and offsetHeight
     *
     * The .width and .height defaults to 300px and
     * 150px and we have to change them to match the
     * .offsetWidth and .offsetHeight, which are the
     * layout width and heights of our scaled canvas
     * (the ones we have set in our CSS file)
     */
    _resizeCanvas() {
      const { canvas, ctx } = this;
      const temp_cnvs = document.createElement('canvas');
      const temp_cntx = temp_cnvs.getContext('2d');
      
      temp_cnvs.width = canvas.offsetWidth;
      temp_cnvs.height = canvas.offsetHeight;
      temp_cntx.fillStyle = "#fff";
      temp_cntx.fillRect(0, 0, temp_cnvs.width, temp_cnvs.height);
      temp_cntx.drawImage(canvas, 0, 0);
  
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Clear the canvas for the browser that don't fully clear it
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(temp_cnvs, 0, 0);
      
      temp_cnvs.remove();
    }
  
    /**
     * Get the mouse input and draw on our canvas
     *
     * @param {MouseEvent} e    The mousemove event
     * @private
     */
    _emitDrawingData(e) {
        const {
            canvas,
            name,
            color,
            thickness,
            socket,
            socketEvents,
        } = this;
    
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const data = {
            name,
            x,
            y,
            color,
            thickness,
        }

        // data.color = '#6b6cc2';
        data.thickness = 6;

        // Emit drawing data to other people
        socket.emit(socketEvents.DRAW, data);

        // const { ctx } = this;
        
        // ctx.beginPath();+
        // ctx.strokeStyle = color;
        // ctx.lineWidth = thickness;
        // ctx.moveTo(x, y);
        // ctx.lineTo(x + 0.1, y + 0.1);
        // ctx.lineJoin = 'round';
        // ctx.lineCap = 'round';
        // ctx.stroke();
    }
  
    /**
     * Get the drawing data from the socket and basically
     * draw on our canvas whatever the other person draws
     *
     * @param {Object} data     The drawing data
     * @private
     */
    _socketDraw(data) {
      const {
        prev,
        curr,
        color,
        thickness,
      } = data;

      const { ctx } = this;
      
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  
    /**
     * Save our canvas drawing as an image file.
     * Using this method allows us to have a custom
     * name for the file we will download
     *
     * Source: http://stackoverflow.com/a/18480879
     *
     * @param {string} filename     The name of the image file
     */
    download(filename) {
      const lnk = document.createElement('a');
      lnk.download = filename;
      lnk.href = this.canvas.toDataURL();
  
      if (document.createEvent) {
        const e = document.createEvent('MouseEvents');
        e.initMouseEvent('click', true, true, window,
          0, 0, 0, 0, 0, false,
          false, false, false, 0, null);
  
        lnk.dispatchEvent(e);
      } else if (lnk.fireEvent) {
        lnk.fireEvent('onclick');
      }
    }
  
    /**
     * Increase the thickness
     *
     * @param {number} step     The amount of the increase
     *                          (e.g. `.increaseThickness(1)`
     *                          will increase the thickness by 1 pixel)
     */
    increaseThickness(step) {
      this.thickness += step;
  
      if (this.thickness > this.thicknessMax) {
        this.thickness = this.thicknessMax;
      }
    }
  
    /**
     * Decrease the thickness
     *
     * @param {number} step     The amount of the decrease
     *                          (e.g. `.decreaseThickness(1)`
     *                          will decrease the thickness by 1 pixel)
     */
    decreaseThickness(step) {
      this.thickness -= step;
  
      if (this.thickness < this.thicknessMin) {
        this.thickness = this.thicknessMin;
      }
    }
  
    /**
     * Clear the entire canvas
     */
    clear() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}