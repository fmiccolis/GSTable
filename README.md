# GSTable
A Spring-like implementation to read, write, manipulate and delete rows from Google Sheets Tables 

## How it works
### Prerequisites
Create a new spreadsheet in your preferred Google Drive folder. After that open it and go to "extensions" -> "Apps Script".  
Copy the GSTable.js (into a GSTable.gs) file as it is and create a classes.gs (In this file you will put your classes).  
Finally create a main.gs where you put your logic

To use GSTable you need to create a class just like you do it in Spring.  
This class have to extend the GSTable Superclass (copy this code into `classes.gs`)  
```js
class Item extends GSTable {
  constructor(name, quantity, image) {
    super();
    this.name = GSTable.COLUMN().STRING(name);
    this.quantity = GSTable.COLUMN().NUMBER(quantity);
    this.image = GSTable.COLUMN().STRING(image);
  }

  static folderNames() {
    return {
      "images": "Item_Images"
    }
  }
}
```
Then to use the new class you only need to create an element via the constructor and save it (copy this code into `main.gs`)  
```js
function testFunction() {
  var item = new Item("esempio", 10, "path/to/image.jpg");
  item.persist();
}
```
By executing `testFunction` into the spreadshhet will be added the sheet and a new row will be created.
