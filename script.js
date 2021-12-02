// When the mouse move we update the position of the mouse and manage the offset due to the canvas
window.addEventListener('mousemove', function(event) {
    event.preventDefault();
    mouse.x = event.x - canvas.getBoundingClientRect().x;
    mouse.y = event.y - canvas.getBoundingClientRect().y;
});

/* 
When the mouse is down (ie. the user does a "click"), we check on each rectangle if the user want to move a rectangle or resize a rectange
*/
window.addEventListener('mousedown', function(event) {
    event.preventDefault();
    mouseX = event.x - canvas.getBoundingClientRect().x;
    mouseY = event.y - canvas.getBoundingClientRect().y;

    // In case of an overlap, only the element on the top has the focus
    let oneElementHasFocus = false;

    for(let i = rectangles.length - 1; i >=0; i--) {

        // First, check if the user want to resize an element
        rectangles[i].isInAHitBox(mouseX, mouseY) // isInAHitBox() update the value isResizingOn. If it is -1 the user is not trying to resize
        // If one element has already the focus, the others elements can't have the focus. This prevent to have 2 elements resizing in the same time.
        if (!oneElementHasFocus && rectangles[i].isResizingOn != -1) {
            rectangles[i].onFocus = true;
            oneElementHasFocus = true;

            //rectangles[i].initialDistance = distanceMouseToCenter(rectangles[i])
        } else
        // Then, we check if the user want to drag an element
        // If one element has already the focus, the others elements can't have the focus. This prevent to have 2 elements moving in the same time.
        if(!oneElementHasFocus && rectangles[i].isInTheRectange(mouseX, mouseY)) {
            document.body.style.cursor = "move";
            rectangles[i].isDragagging = true;
            rectangles[i].onFocus = true;
            oneElementHasFocus = true;
        }
        // The user is nit trying to move a rectange or resize it, we set the corresponding parameter to false (or -1)
        else{
            rectangles[i].isDragagging = false;
            rectangles[i].onFocus = false;
            rectangles[i].isResizingOn = -1;
        }
    }
    oneElementHasFocus = false;

});

// If the mouse is up, the moving or the resizing action is stop so we set the corresponding parameter to false (or -1)
window.addEventListener('mouseup', function(event) {
    event.preventDefault();
    rectangles.forEach((rectangle) => { 
        rectangle.isDragagging = false;
        rectangle.isResizingOn = -1;
    });
    document.body.style.cursor = "default";
});


class Rectangle{
    constructor(x, y, width, height, colour) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isDragagging = false;
        this.isResizingOn = -1; // The numero of the hitbox use to resize, if no hitbox is hit, the value is set to 1
        this.onFocus = false;
        this.mainColour = colour.main;
        this.focusColour = colour.focus;
        this.hitBoxesOnShape = [];
        this.hitBoxesRadius = 7;
        // initial position of the mouse when you start the drap and drop
        this.startX = 0;
        this.startY = 0;
        this.initialDistance = 0; // initial distance between the mouse and the center of a rectangle when you start resizing
    }

    draw() {
        c.beginPath();
        c.rect(this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height);
        c.fillStyle = this.onFocus ? this.focusColour : this.mainColour;
        c.fill();
        c.closePath();
    }

    drawOnFocus() {
        this.draw();
        this.hitBoxesOnShape = [[this.x - this.width / 2, this.y - this.height / 2], // top left corner
                            [this.x, this.y -  this.height / 2], // middle top
                            [this.x + this.width / 2, this.y - this.height / 2], // top right corner
                            [this.x + this.width / 2, this.y], // middle right
                            [this.x + this.width / 2, this.y + this.height / 2], //bottom right
                            [this.x, this.y + this.height / 2], // middle bottom
                            [this.x - this.width / 2, this.y + this.height / 2], //bottom left
                            [this.x - this.width / 2, this.y]
                        ];
        this.hitBoxesOnShape.forEach((hitBox) => {
            c.beginPath()
            c.arc(hitBox[0], hitBox[1], this.hitBoxesRadius, 0, Math.PI * 2, false)
            c.fillStyle = "#CCCCCC";
            c.fill();
            c.closePath();
        });
    }

    move(dx, dy) {
        let newX = this.x - dx;
        let newY = this.y - dy;
        if (newX - this.width / 2 <= 0 && dx > 0) {
            dx = 0;
            this.x = this.width / 2;
        }
        if (newY - this.height / 2 <= 0 && dy > 0) {
            dy = 0;
            this.y = this.height/2
        }
        if (newX + this.width / 2 >= canvas.width && dx < 0) {
            dx = 0;
            this.x = canvas.width - this.width / 2;
        }
        if (newY + this.height / 2 >= canvas.height && dy < 0) {
            dy = 0;
            this.y = canvas.height - this.height / 2;
        }
        this.x -= dx;
        this.y -= dy;
        this.draw()
    }

    isInTheRectange(mouseX, mouseY){
        if (mouseX > this.x - this.width * 0.5 && mouseX < this.x + this.width * 0.5 && mouseY > this.y - this.height * 0.5 && mouseY < this.y + this.height * 0.5) {
            this.startX = mouse.x;
            this.startY = mouse.y;
            return true;
        } else {
            return false;
        }
    }

    isInAHitBox(mouseX, mouseY){    
        let hitNumber = -1;
        for (let i = 0; i < this.hitBoxesOnShape.length; i++) {
            this.startX = mouse.x;
            this.startY = mouse.y;
            if (Math.pow(mouseX - this.hitBoxesOnShape[i][0], 2) + Math.pow(mouseY - this.hitBoxesOnShape[i][1], 2) <= Math.pow(this.hitBoxesRadius, 2)){
                hitNumber = i;
                break;
            }
        }
        this.isResizingOn = hitNumber;
    }

    resize(dx, dy){
        let newX = this.x;
        let newY = this.y;
        let newWidth= this.width;
        switch (this.isResizingOn){
            case 0:
                document.body.style.cursor = "nw-resize";
                this.x -= dx / 2;
                this.y -= dy / 2;
                this.width += dx;
                this.height += dy;
                break;
            case 2:
                document.body.style.cursor = "ne-resize";
                this.x -= dx /2;
                this.y -= dy / 2;
                this.width -= dx;
                this.height += dy;
                break;
            case 4:
                document.body.style.cursor = "se-resize";
                this.x -= dx /2;
                this.y -= dy / 2;
                this.width -= dx;
                this.height -= dy;
                break;
            case 6:
                document.body.style.cursor = "sw-resize";
                this.x -= dx / 2;
                this.y -= dy / 2;
                this.width += dx;
                this.height -= dy;
                break;
            case 1:
                document.body.style.cursor = "n-resize";
                this.y -= dy / 2;
                this.height += dy;
                break;
            case 3:
                document.body.style.cursor = "e-resize";
                this.x -= dx /2;
                this.width -= dx;
                break;
            case 5:
                document.body.style.cursor = "s-resize";
                this.y -= dy / 2;
                this.height -= dy;
                break;
            case 7:
                document.body.style.cursor = "w-resize";
                this.x -= dx / 2;
                this.width += dx;
                break
            default:
                break;
        }
        this.drawOnFocus();     
    }
}

function swap(indexElm1, indexElm2, array) {
    const buff = array[indexElm1];
    array[0] = array[indexElm2];
    array[indexElm2] = buff;
}

function notify(text) {
    let elm = document.getElementById('notification');
    elm.innerHTML = text
}

function distanceMouseToCenter(rectangle) {
    return Math.sqrt(Math.pow(mouse.x - rectangle.x, 2) + Math.pow(mouse.y - rectangle.y, 2))
}

function isInArea(rectange, newX, newY, newWidth, newHeight) {
    
    if (newX - this.width / 2 <= 0 && dx > 0) {
        dx = 0;
        this.x = this.width / 2;
    }
    if (newY - this.height / 2 <= 0 && dy > 0) {
        dy = 0;
        this.y = this.height/2
    }
    if (newX + this.width / 2 >= canvas.width && dx < 0) {
        dx = 0;
        this.x = canvas.width - this.width / 2;
    }
    if (newY + this.height / 2 >= canvas.height && dy < 0) {
        dy = 0;
        this.y = canvas.height - this.height / 2;
    }
}

function isRectangeOverlaping(rect1){
    const { x, y, width, height } = rect1;
    let overlap = false;
    rectangles.forEach((rect2) => {
        if (rect1 != rect2) {
            if (Math.abs(x - rect2.x) < width/2 + rect2.width/2 && Math.abs(y - rect2.y) < height/2 + rect2.height/2) {
                overlap = true;
                indexRec2 = rectangles.indexOf(rect2)
                if (!rect2.onFocus && rect1.onFocus && indexRec2 != 0) {
                    swap(0, indexRec2, rectangles)
                    rectangles[0].draw()
                }   
            }
        }
    });
    return overlap
}

function animate() {
    requestAnimationFrame(animate);
    let notifyOverlaping = false;

    c.clearRect(0,0, canvas.width, canvas.height);

    rectangles.forEach((rectangle) => {
        notifyOverlaping = isRectangeOverlaping(rectangle)

        if (rectangle.onFocus) {
            var dx = rectangle.startX - mouse.x;
            var dy = rectangle.startY - mouse.y;
            if(rectangle.isDragagging == true) {
                rectangle.move(dx, dy);
                rectangle.startX = mouse.x;
                rectangle.startY = mouse.y;
            } else if (rectangle.isResizingOn != -1) {
                rectangle.resize(dx, dy);
                rectangle.startX = mouse.x;
                rectangle.startY = mouse.y;
            } 
             else {
                rectangle.drawOnFocus();
            }
        }
        else {
            rectangle.draw()
            
        }
        
    });
    if (notifyOverlaping) notify("Overlapping")
    else notify("")
}

// Setup the canvas
var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var c = canvas.getContext("2d");

// The object mouse contains the position of the mouse
var mouse = {
    x: undefined,
    y: undefined
}

/*
The object colourPalette contains colours for the rectangles.
The main colour is display by default. The focus colour is display when the rectangle "has the focus"
*/
var colourPalette = {
    red: { main: "#FF3311", focus: "#FF8866"},
    blue: { main: "#1133FF", focus: "#6688FF"},
};

var rectangles = []
rectangles.push(new Rectangle(300, 400, 150, 200, colourPalette.red));

rectangles.push(new Rectangle(200, 150, 150, 100, colourPalette.blue));

rectangles.forEach((rectangle) => {
    rectangle.draw();
});

animate();