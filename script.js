/*
@Author: Pierre-Louis JALLERAT
@Date : 03/12/2021

The following program contains a source code of web page with an animation
It displays 2 rectangles. They can be move and resize within the window
If the rectangles overlap, the user is notified
*/


// When the mouse move, update the position of the object mouse and manage the offset due to the canvas position
window.addEventListener('mousemove', function(event) {
    event.preventDefault();
    mouse.x = event.x - canvas.getBoundingClientRect().x;
    mouse.y = event.y - canvas.getBoundingClientRect().y;
});

 
// When the mouse is down, check on each rectangle if the user want to move or resize a rectangle
window.addEventListener('mousedown', function(event) {
    event.preventDefault();
    mouseX = event.x - canvas.getBoundingClientRect().x;
    mouseY = event.y - canvas.getBoundingClientRect().y;

    /* 
    In case of an overlap, only the rectangle on the top has the focus
    The other(s) won't be able to be moved and resized
    */
    let oneElementHasFocus = false;

    for(let i = rectangles.length - 1; i >=0; i--) {
        /*
        First, check if the user try the resize a rectange
        isInAHitBox() updates the value isResizingOn. If it is -1 the user did not click on a hitbox
        Else it update isResizingOn with the numero of the hitbox the user click on. This value will be use in the
        animate function to resize the rectangle. Also we put the focus on the rectangle.
        */
        rectangles[i].isInAHitBox(mouseX, mouseY)
        if (!oneElementHasFocus && rectangles[i].isResizingOn != -1) {
            rectangles[i].onFocus = true;
            oneElementHasFocus = true;
        } else

        /*.
        If a user click on a rectangle, we put the focus on the rectangle
        Also, we set the attribute isDragging to true so it can me be move in the animate function
        */
        if(!oneElementHasFocus && rectangles[i].isInTheRectange(mouseX, mouseY)) {
            document.body.style.cursor = "move";
            rectangles[i].isDragagging = true;
            rectangles[i].onFocus = true;
            oneElementHasFocus = true;
        }
        // If the user is not trying to move or resize the rectange, we set the corresponding parameter to false (or -1)
        else{
            rectangles[i].isDragagging = false;
            rectangles[i].onFocus = false;
            rectangles[i].isResizingOn = -1;
        }
    }
    oneElementHasFocus = false;

});

// If the mouse is up, moving or resizing actions are stop and we set the corresponding parameters to false (or -1)
window.addEventListener('mouseup', function(event) {
    event.preventDefault();
    rectangles.forEach((rectangle) => {
        rectangle.isDragagging = false;
        rectangle.isResizingOn = -1;
    });
    document.body.style.cursor = "default";
});


/**
 * Rectangle Class
 * A rectangle can be move or resize within the windows.
 * It has a "focus" state. Clicking a rectange put the focus on it. Once it has the focus, 8 circles (hitboxes) are drew on the boundaries.
 * 
 * A rectange which has the focus can be drag or resize (not both in the same time)
 * 
 * To move a rectangle, the user has to click on it, maintain the pressure on the mouse and move it. 
 * To be move a rectangle need to have the attribute "isDragging" set to true.
 * 
 * To resize a rectange, the user has first to click on the rectange to set the focus on it.
 * Then the user click on one of the circle (hitbox) on its boundaries. This update the attribute isResizingOn with the numero 
 * of the hitbox the user click on. If the user did not click on a hit box, isResizingOn is set to -1.
 * To resize a rectangle, the user has to click on hitbox, maintain the pressure on the mouse and move it.
 */
class Rectangle{
    /**
     * Contructor of the class
     * 
     * @param x X coordinate of the rectange's center 
     * @param y Y coordinate of the rectange's center
     * @param width initial width 
     * @param height initial height 
     * @param colour initial color
     */
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
        this.hitBoxesOnShape = []; // Contains the 8 circles drawn when the rectangle has the focus 
        this.hitBoxesRadius = 7;
        // initial position of the mouse when you start the dragging/resizing
        this.startX = 0;
        this.startY = 0;
    }

    /**
     * Draw the rectangle in the canvas
     */
    draw() {
        c.beginPath();
        c.rect(this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height);
        c.fillStyle = this.onFocus ? this.focusColour : this.mainColour;
        c.fill();
        c.closePath();
    }

    /**
     * Function called to a rectangle which has the foxus
     * Draw the rectange and the 8 circles on its boundaries.
     */
    drawOnFocus() {
        this.draw();
        this.hitBoxesOnShape = [[this.x - this.width / 2, this.y - this.height / 2], // top left corner
                            [this.x, this.y -  this.height / 2], // middle top
                            [this.x + this.width / 2, this.y - this.height / 2], // top right corner
                            [this.x + this.width / 2, this.y], // middle right
                            [this.x + this.width / 2, this.y + this.height / 2], //bottom right
                            [this.x, this.y + this.height / 2], // middle bottom
                            [this.x - this.width / 2, this.y + this.height / 2], //bottom left
                            [this.x - this.width / 2, this.y] // middle left
                        ];
        this.hitBoxesOnShape.forEach((hitBox) => {
            c.beginPath()
            c.arc(hitBox[0], hitBox[1], this.hitBoxesRadius, 0, Math.PI * 2, false)
            c.fillStyle = "#CCCCCC";
            c.fill();
            c.closePath();
        });
    }

    /**
     * Move the rectangle according to mouvement of the mouse.
     * Prevent the rectange to be move out of the window
     * 
     * @param dx movement of the mouse in the axis-X
     * @param dy movement of the mouse in the axis-Y
     */
    move(dx, dy) {
        let newX = this.x - dx;
        let newY = this.y - dy;

        /*
        If the possible new values of X and Y lead to draw the rectangle out
        of the window, we correct the new value of X and Y so it stay inside the window
        */

        // Prevent movement across the left border
        if (newX - Math.abs(this.width) / 2 <= 0 && dx > 0) {
            dx = 0;
            this.x = Math.abs(this.width) / 2;
        }
        // Prevent movement across the top border 
        if (newY - Math.abs(this.height) / 2 <= 0 && dy > 0) {
            dy = 0;
            this.y = Math.abs(this.height) /2
        }
        // Prevent movement across the right border
        if (newX + Math.abs(this.width) / 2 >= canvas.width && dx < 0) {
            dx = 0;
            this.x = canvas.width - Math.abs(this.width) / 2;
        }
        // Prevent movement across the bottom border
        if (newY + Math.abs(this.height) / 2 >= canvas.height && dy < 0) {
            dy = 0;
            this.y = canvas.height - Math.abs(this.height) / 2;
        }

        // Update position
        this.x -= dx;
        this.y -= dy;
        this.draw()
    }

    /**
     * Check if the mouse position is inside a rectange
     * 
     * @param mouseX position of the mouse in the axis-X
     * @param mouseY position of the mouse in the axis-Y
     * @returns 
     */
    isInTheRectange(mouseX, mouseY){
        if (mouseX > this.x - Math.abs(this.width) * 0.5 && mouseX < this.x + Math.abs(this.width) * 0.5 && mouseY > this.y - Math.abs(this.height) * 0.5 && mouseY < this.y + Math.abs(this.height) * 0.5) {
            this.startX = mouse.x;
            this.startY = mouse.y;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Check if the mouse position is inside one of the 8 circles of the focus rectangle
     * If yes, the function update this.isResizingOn with the numero of the circle hit by the user click
     * If no, this.isResizingOn = -1
     * 
     * @param mouseX position of the mouse in the axis-X
     * @param mouseY position of the mouse in the axis-Y
     */
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


    /**
     * Resize the rectangle according to mouvement of the mouse.
     * The way a rectange is resized depend on the hitbox the user clicks on.
     * Each hitbox (or circle) is manage differently.
     * 
     * @param dx movement of the mouse in the axis-X
     * @param dy movement of the mouse in the axis-Y
     */
    resize(dx, dy){
        let newX = this.x;
        let newY = this.y;
        let newWidth = this.width;
        let newHeight = this.height;

        /*
        Compute the possible new size and position.
        sResizingOn correspond to the numero of the hitbox the user clicks on
        */
        switch (this.isResizingOn){
            case 0: // top left
                newX -= dx / 2;
                newY -= dy / 2;
                newWidth += dx;
                newHeight += dy;
                break;
            case 2: // top right
                newX -= dx /2;
                newY -= dy / 2;
                newWidth -= dx;
                newHeight += dy;
                break;
            case 4: // bottom right
                newX -= dx /2;
                newY -= dy / 2;
                newWidth -= dx;
                newHeight -= dy;
                break;
            case 6: // bottom left
                newX -= dx / 2;
                newY -= dy / 2;
                newWidth += dx;
                newHeight -= dy;
                break;
            case 1: // middle top
                newY -= dy / 2;
                newHeight += dy;
                break;
            case 3: //middle right
                newX -= dx /2;
                newWidth -= dx;
                break;
            case 5: //middle bot
                newY -= dy / 2;
                newHeight -= dy;
                break;
            case 7: // middle left
                newX -= dx / 2;
                newWidth += dx;
                break
            default:
                break;
        }

        /*
        Correct the new values x, y, width and height if they are out of the window if the lead to draw a new rectangle
        out of teh windows.
        We calculate the length of the part out of the windows and call it "offset"
        Then we shift the rectangle and resize its width/length using the offset so it stay completely inside the windows
        */

        // Prevent the rectange to be resize on the other side of the left boundary
        if (newX - Math.abs(newWidth) / 2 <= 0) {
            let offset = -1 * (newX - Math.abs(newWidth) / 2);
            if (newWidth > 0) newWidth -= offset;
            else newWidth += offset
            newX = newX + offset / 2;
        }
        
        // Prevent the rectange to be resize on the other side of the right boundary
        if(newX + Math.abs(newWidth) / 2 >= canvas.width) {
            let offset = (newX + Math.abs(newWidth) / 2) - canvas.width;
            if (newWidth > 0) newWidth -= offset;
            else newWidth += offset;
            newX = newX - offset / 2;
        }

        // Prevent the rectange to be resize on the other side of the top boundary
        if(newY - Math.abs(newHeight) / 2 <= 0) {
            let offset = -1 * (newY - Math.abs(newHeight) / 2);
            if (newHeight > 0) newHeight -= offset;
            else newHeight += offset
            newY = newY + offset / 2;
        }

        // Prevent the rectange to be resize on the other side of the bottom boundary
        if(newY + Math.abs(newHeight) / 2 >= canvas.height) {
            let offset = (newY + Math.abs(newHeight) / 2) - canvas.height;
            if (newHeight > 0) newHeight -= offset;
            else newHeight += offset;
            newY = newY - offset / 2;
        }

        // Update size and position after correct
        this.x = newX;
        this.y = newY;
        this.width = newWidth;
        this.height = newHeight;

        this.drawOnFocus();     
    }
}

/**
 * Swap the position of 2 elements in a list
 * 
 * @param indexElement1 index of the first element
 * @param indexElement2 index of the second element
 * @param array 
 */
function swap(indexElement1, indexElement2, array) {
    const buff = array[indexElement1];
    array[indexElement1] = array[indexElement2];
    array[indexElement2] = buff;
}

/**
 * Update the notification message on the html page with a message depending if there is an overlap
 * 
 * @param isOverlaping true if 2 rectangles overlap, else false 
 */
function notifyOverlaping(isOverlaping) {
    let elm = document.getElementById('notification');
    let img = document.getElementById('righ-corner').getElementsByTagName("img")[0]
    if (isOverlaping) {
        elm.style.color = "#fad271"
        elm.innerText = "The rectangles are overlaping"
        img.style.display = "block";
    } else {
        elm.style.color = "#EEE"
        elm.innerText = ""
        img.style.display = "none";
    }
}

/**
 * Check if a rectangle overlap with another rectangle. 
 * To do that, we compare the positions, the width and height of each rectangle
 * If the rectange overlap another rectangle and has the focus, we move the rectangle to the foreground (if it is not already)
 * 
 * @param rectangle1 
 * @returns true is the rectangle overlap with another rectangle else false
 */
function isRectangeOverlap(rectangle1){
    const { x, y, width, height } = rectangle1;
    let overlap = false;

    rectangles.forEach((rectangle2) => {
        if (rectangle1 != rectangle2) {
            /* To check if 2 rectangles overlap, we check the difference of their positions (x,y) 
            Important reminder: (x, y) corresponds to the center of a rectangle
            If the difference of positions x is inferior to the sum of the half of each of the widths
            and the difference of positions y is inferior to the the sum of the half of each of the heights: they overlap !
            */
            if (Math.abs(x - rectangle2.x) < Math.abs(width) / 2 + Math.abs(rectangle2.width) / 2 &&
             Math.abs(y - rectangle2.y) < Math.abs(height) / 2 + Math.abs(rectangle2.height / 2)) {
                overlap = true; 
            }
        }
    });
    // If there is an overlap and the rectangle which has the focus is not on the foreground, we move it to the foreground
    let lastIndex = rectangles.length - 1;
    indexRectangle1 = rectangles.indexOf(rectangle1)
    if (rectangle1.onFocus && indexRectangle1 != lastIndex) {
        swap(lastIndex, indexRectangle1, rectangles) // The last rectangle in the array is the one drawn on the foreground
        rectangles[lastIndex].draw()
    }  
    return overlap
}

/**
 * The function iterate endlessy. We use it to update the rectangles at all times
 * It start by clearing the canvas. Then it itirate throught an array of rectangles 
 * and draw them depending on their states (focus, draging, resize or default)
 * 
 */
function animate() {
    requestAnimationFrame(animate);
    let overlap = false;

    c.clearRect(0,0, canvas.width, canvas.height);

    rectangles.forEach((rectangle) => {
        overlap = isRectangeOverlap(rectangle)

        if (rectangle.onFocus) {
            // Get the difference of mouse's positiosn between 2 itirations to get the mouvement of the mouse
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
    notifyOverlaping(overlap);
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
The main colour is display by default. The focus colour is displayed when the rectangle has the focus
*/
var colourPalette = {
    red: { main: "#FF3311", focus: "#FF8866"},
    blue: { main: "#1133FF", focus: "#6688FF"},
};

// Contains the rectangles to display
var rectangles = []

// The 2 rectangles which are going to display. Feel free to add more if you want.
rectangles.push(new Rectangle(300, 400, 150, 200, colourPalette.red));
rectangles.push(new Rectangle(200, 150, 150, 100, colourPalette.blue));


rectangles.forEach((rectangle) => {
    rectangle.draw();
});

animate();