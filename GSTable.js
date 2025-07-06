/**
 * Superclass to create db-like table in Google sheets
 * @example
 * // Example extends MyTable with GSTable:
 * class MyTable extends GSTable {
 *  constructor(name, age, city) {
 *    super();
 *    this.name = GSTable.COLUMN().STRING(age);
 *    this.age = GSTable.COLUMN().NUMBER(age);
 *    this.city = GSTable.COLUMN().STRING(city);
 *  }
 * }
 */
class GSTable {
    /**
     * Constructor for GSTable class.
     * These parameters are the default one added to every table.
     * @constructor
     * @param {string} id - The ID of the object.
     * @param {number} row_number - The row number (note that it's not a column but an utility parameter).
     * @param {Date} created - The creation date.
     * @param {Date} modified - The last modification date.
     * @param {string} created_by - The creator of the object.
     * @param {string} last_modified_by - The user who last modified the object.
     */
    constructor(id = "", row_number = 0, created = new Date(), modified = new Date(), created_by = "", last_modified_by = "") {
      this.id = GSTable.COLUMN().STRING(id);
      this.row_number = row_number;
      this.created = GSTable.COLUMN().DATE(created);
      this.modified = GSTable.COLUMN().DATE(modified);
      this.created_by = GSTable.COLUMN().STRING(created_by);
      this.last_modified_by = GSTable.COLUMN().STRING(last_modified_by);
    }
  
    /**
     * Factory function for creating column definitions.
     * @static
     * @returns {Object} - An object with column creation functions.
     *
     * @description This static method is used to create column definitions for the properties
     * of the `GSTable` class. It provides a set of functions that allow you to define the
     * characteristics of each column, such as data type and whether it is required. These
     * definitions are used to set up the structure of the Google Sheets table associated with
     * the class. Each column function returns an object with properties that define the
     * column's characteristics.
     *
     * @returns {Object} - An object containing column creation functions:
     *   - DATE {Function} - Creates a date column definition.
     *   - STRING {Function} - Creates a string column definition.
     *   - NUMBER {Function} - Creates a number column definition.
     *   - BOOLEAN {Function} - Creates a boolean column definition.
     *   - FOREIGNKEY {Function} - Creates a foreign key column definition.
     *
     * @param {any} [value] - The default value for the column.
     * @param {boolean} [required=true] - Indicates whether the column is required.
     *
     * @example
     * // Example usage to define a string column with a default value:
     * const columnDefinition = GSTable.COLUMN().STRING("Sample String", true);
     */
    static COLUMN() {
        /**
         * Creates a date column definition.
         * @param {Date} [value] - The default value for the column.
         * @param {boolean} [required=true] - Indicates whether the column is required.
         * @returns {Object} - The date column definition object.
         */
        function DATE(value, required = true) {
            return { _value: value || "", _type: "date", _required: required };
        }

        /**
         * Creates a time column definition.
         * @param {String} [value] - The default value for the column in the format hh:mm.
         * @param {boolean} [required=true] - Indicates whether the column is required.
         * @returns {Object} - The time column definition object.
         */
        function TIME(value, required = true) {
            return { _value: value || "", _type: "time", _required: required };
        }
    
        /**
         * Creates a string column definition.
         * @param {string} [value] - The default value for the column.
         * @param {boolean} [required=true] - Indicates whether the column is required.
         * @returns {Object} - The string column definition object.
         */
        function STRING(value, required = true) {
            return { _value: value || "", _type: "str", _required: required };
        }
    
        /**
         * Creates a number column definition.
         * @param {number} [value] - The default value for the column.
         * @param {boolean} [required=true] - Indicates whether the column is required.
         * @returns {Object} - The number column definition object.
         */
        function NUMBER(value, required = true) {
            return { _value: value || 0, _type: "number", _required: required };
        }
    
        /**
         * Creates a boolean column definition.
         * @param {boolean} [value] - The default value for the column.
         * @param {boolean} [required=true] - Indicates whether the column is required.
         * @returns {Object} - The boolean column definition object.
         */
        function BOOLEAN(value, required = true) {
            return { _value: value || false, _type: "bool", _required: required };
        }
    
        /**
         * Creates a foreign key column definition.
         * @param {string} [value] - The default value for the column.
         * @param {string} class_name - The name of the associated class.
         * @param {boolean} [required=true] - Indicates whether the column is required.
         * @returns {Object} - The foreign key column definition object.
         */
        function FOREIGNKEY(value, class_name, required = true) {
            return {
                _value: value || "",
                _type: "fk",
                _required: required,
                _class: class_name,
            };
        }
    
        // Return an object containing all column creation functions.
        return {DATE, TIME, STRING, NUMBER, BOOLEAN, FOREIGNKEY};
    }
  
    /**
     * Checks if the given object is a valid column definition.
     * @static
     * @param {Object} [propertyInfo={}] - The property information object to check.
     * @returns {boolean} - True if it's a valid column definition, false otherwise.
     *
     * @description This static method is used to determine whether a given object represents
     * a valid column definition based on specific properties that are expected. A valid column
     * definition should contain '_value', '_type', and '_required' properties.
     *
     * @param {Object} [propertyInfo={}] - The property information object to check.
     * @returns {boolean} - True if the object is a valid column definition, false otherwise.
     *
     * @example
     * const columnDefinition = {
     *   _value: "Sample Value",
     *   _type: "str",
     *   _required: true
     * };
     * const isValid = GSTable.isColumn(columnDefinition); // Returns true
     */
    static isColumn(propertyInfo = {}) {
      var keys = Object.keys(propertyInfo);
      if(keys.length === 0) return false;
  
      var diff = ["_value", "_type", "_required"].filter((prop) => !keys.includes(prop));
      return diff.length === 0;
    }
  
    /**
     * Retrieves table information, including sheet details and headers.
     * @static
     * @returns {Object} - An object with sheet and headers information.
     *
     * @description This method is used to obtain information about the Google Sheets
     * table, such as the sheet name and headers. It also ensures that the sheet exists
     * in the active spreadsheet or creates one if it doesn't exist. The headers of the
     * sheet are synchronized with the class properties, adding new headers and removing
     * any unnecessary ones. The method is responsible for ensuring that the table in
     * Google Sheets is properly configured and up to date.
     *
     * @returns {Object} - An object containing:
     *   - sheet {GoogleAppsScript.Spreadsheet.Sheet}: The Google Sheets sheet where the table data is stored.
     *   - headers {Array<string>}: An array of header names that correspond to class properties.
     *
     * @throws {Error} If any error occurs during the creation or update of the sheet.
     */
    static getTableInfo() {
        var emptyObj = new this();
        var class_props = Object.getOwnPropertyNames(emptyObj);
      
        // Filter out non-column properties and get the names of columns.
        class_props = class_props.filter((prop) => this.isColumn(emptyObj[prop]));
      
        // Determine the sheet name based on the class name.
        var sheet_name = emptyObj.constructor.name;
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName(sheet_name);
      
        var headers = [];
      
        if (sheet === null) {
          // Create a new sheet with headers if it doesn't exist.
          sheet = ss.insertSheet(sheet_name);
          sheet.appendRow(class_props);
          headers = [...class_props];
        } else {
          // Update headers based on class properties.
          headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
          var new_props = class_props.filter((n) => !headers.includes(n));
      
          if (new_props.length > 0) {
            sheet.getRange(1, sheet.getLastColumn() + 1, 1, new_props.length).setValues([new_props]);
          }
      
          var columns_to_delete = headers.filter((n) => !class_props.includes(n));
      
          if (columns_to_delete.length > 0) {
            columns_to_delete.forEach((column) => {
              var column_index = headers.indexOf(column) + 1;
              sheet.deleteColumn(column_index);
            });
          }
          headers.concat(new_props);
        }
        SpreadsheetApp.flush();
      
        return { sheet, headers };
    }
  
    /**
     * Generates a random ID of the specified length.
     * @static
     * @param {number} length - The length of the ID to generate.
     * @returns {string} - A random ID of the specified length.
     *
     * @description This static method generates a random alphanumeric ID of the specified length.
     *
     * @param {number} length - The length of the ID to generate.
     * @returns {string} - A random ID consisting of uppercase letters, lowercase letters, and digits.
     *
     * @throws {Error} If the length is less than or equal to 0.
     *
     * @example
     * const id = GSTable.generateId(8); // Generates an 8-character random ID.
     */
    static generateId(length) {
        if (length <= 0) {
            // Throw an error if the length is invalid.
            throw new Error('Length must be greater than 0');
        }

        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;

        // Generate the random ID character by character.
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }

        return result;
    }
  
    /**
     * Converts raw data from a Google Sheets range into an array of objects.
     * @static
     * @param {Array} [rawData=[]] - The raw data to be converted.
     * @returns {Array} - An array of objects with property-value pairs.
     *
     * @description This static method is used to convert raw data retrieved from a Google
     * Sheets range into an array of JavaScript objects. Each object represents a row of data,
     * with property names corresponding to the headers from the raw data. The method handles
     * mapping the headers to properties and creating objects for each row.
     *
     * @param {Array} [rawData=[]] - The raw data retrieved from a Google Sheets range.
     * @returns {Array} - An array of objects, each representing a row of data.
     *
     * @example
     * const rawData = [
     *   ['Name', 'Age', 'City'],
     *   ['Alice', 28, 'New York'],
     *   ['Bob', 35, 'Los Angeles'],
     * ];
     * const data = GSTable.fromRawDataToArrayOfObject(rawData);
     * // Returns an array of objects like:
     * // [{ Name: 'Alice', Age: 28, City: 'New York' }, { Name: 'Bob', Age: 35, City: 'Los Angeles' }]
     */
    static fromRawDataToArrayOfObject(rawData = []) {
        const headers = rawData.shift();
        var result = []
        rawData.forEach((row, row_id) => {
          // add 2 because of the headers and arrays starts from 0
          var data = {
            row_number: row_id + 2
          }
          row.forEach((cell, index) => {
            data[headers[index]] = cell
          })
          result.push(data)
        })
        return result;
    }
  
    /**
     * Finds and returns an entity by its ID.
     * @static
     * @param {string} id - The ID to search for.
     * @returns {Object|null} - The entity matching the given ID, or null if not found.
     *
     * @description This static method searches for an entity within the data associated with
     * the `GSTable` class based on its ID. If a matching entity is found, it is returned as
     * an object. If no entity with the specified ID is found, the method returns null.
     *
     * @param {string} id - The ID of the entity to search for.
     * @returns {Object|null} - The entity with the specified ID, or null if not found.
     *
     * @example
     * const idToFind = 'ABC123';
     * const foundEntity = MyTable.findById(idToFind);
     * if (foundEntity) {
     *   console.log('Entity found:', foundEntity);
     * } else {
     *   console.log('Entity not found with ID:', idToFind);
     * }
     */
    static findById(id) {
      return this.findAll().find((entity) => entity.id._value === id);
    }
  
    /**
     * Filters entities based on user-defined conditions.
     * @static
     * @param {Object} conditions - The filtering conditions as key-value pairs.
     * @returns {Array} - An array of entities that match the specified conditions.
     *
     * @description This static method filters entities associated with the `GSTable` class
     * based on user-defined conditions. It takes an object with key-value pairs, where each
     * key represents a property and each value is a function that defines a condition. Only
     * entities that satisfy all the conditions are included in the result.
     *
     * @param {Object} conditions - An object with key-value pairs representing filtering conditions.
     * @returns {Array} - An array of entities that meet all specified conditions.
     *
     * @example
     * // Example conditions to filter entities:
     * const conditions = {
     *   Age: (age) => age >= 18, // Filter entities with age greater than or equal to 18.
     *   City: (city) => city === 'New York', // Filter entities with 'City' equal to 'New York'.
     * };
     * const filteredEntities = MyTable.filterByConditions(conditions);
     * console.log('Filtered entities:', filteredEntities);
     */
    static filterByConsitions(conditions) {
      var condition_keys = Object.keys(conditions);
      if(condition_keys.length === 0) return [];
  
      return this.findAll().filter((entity) => {
        return condition_keys.every(key => {
          // ignores non-function predicates
          if (typeof conditions[key] !== 'function') return true;
          return conditions[key](entity[key]);
        });
      });
    }
  
    /**
     * Retrieves all entities associated with the `GSTable` class.
     * @static
     * @returns {Array} - An array of all entities available in the data.
     *
     * @description This static method retrieves all entities associated with the `GSTable`
     * class from the data source, a Google Sheets table. It converts the raw data
     * into an array of JavaScript objects, where each object represents an entity.
     *
     * @returns {Array} - An array of all entities available in the data source.
     *
     * @example
     * const allEntities = MyTable.findAll();
     * console.log('All entities:', allEntities);
     */
    static findAll() {
      var {sheet} = this.getTableInfo();
      var rawArray = this.fromRawDataToArrayOfObject(sheet.getDataRange().getValues());
      return rawArray.map((rawEntity) => this.fromJson(rawEntity));
    }
  
    /**
     * Converts a raw data object into an entity object.
     * @static
     * @param {Object} rawObject - The raw data object to be converted.
     * @returns {Object} - An entity object created from the raw data.
     *
     * @description This static method is used to convert a raw data object, typically
     * retrieved from a data source, into an entity object associated with the class 
     * extended by `GSTable`. The method maps the properties of the raw data object 
     * to the properties of the entity and returns the resulting entity.
     *
     * @param {Object} rawObject - The raw data object to be converted into an entity.
     * @returns {Object} - An entity object created from the raw data.
     *
     * @example
     * const rawEntityData = {
     *   Name: 'Alice',
     *   Age: 28,
     *   City: 'New York',
     * };
     * const entity = MyTable.fromJson(rawEntityData);
     * console.log('Entity created from raw data:', entity);
     */
    static fromJson(rawObject) {
      var dummyObj = new this();
      var properties = Object.getOwnPropertyNames(dummyObj);
  
      properties.forEach((property) => {
        if(this.isColumn(dummyObj[property])) {
          dummyObj[property]._value = rawObject[property];
        } else {
          dummyObj[property] = rawObject[property];
        }
      });
  
      return dummyObj;
    }
  
    /**
     * Sets the value of a specific column in the entity.
     * @param {string} key - The property key for which to set the value.
     * @param {any} value - The new value to assign to the property.
     *
     * @description This method allows you to set the value of a specific column in the entity
     * associated with the extended class by `GSTable`. Provide the property key and the new 
     * value to update the column's value.
     *
     * @param {string} key - The property key to set the value for.
     * @param {any} value - The new value to assign to the property.
     *
     * @example
     * const entity = MyTable.findById('ABC123');
     * entity.setValue('Age', 30);
     * console.log('Updated Age:', entity.getValue('Age'));
     */
    setValue(key, value) {
      this[key]._value = value;
    }
  
    /**
     * Gets the value of a specific column in the entity.
     * @param {string} key - The property key for which to retrieve the value.
     * @returns {any} - The value of the specified property.
     *
     * @description This method retrieves the value of a specific column in the entity
     * associated with the class extended by `GSTable`. You can use the property key as 
     * a parameter to fetch the corresponding column's value.
     *
     * @param {string} key - The name of the column to retrieve the value for.
     * @returns {any} - The value of the specified column.
     *
     * @example
     * const entity = MyTable.findById('ABC123');
     * const ageValue = entity.getValue('Age');
     * console.log('Age:', ageValue);
     */
    getValue(key) {
      return this[key]._value;
    }
  
    /**
     * Retrieves an array of values used to update the row on the Spreadsheet.
     * @returns {Array} - An array of property values ready for an update operation.
     *
     * @description This method extracts the values of properties in the entity that are
     * marked for update and returns them as an array. It prepares the property values for
     * updating the associated data source, typically a Google Sheets table.
     *
     * @returns {Array} - An array of property values ready for an update operation.
     *
     * @example
     * const entity = MyTable.findById('ABC123');
     * const updateArray = entity.getUpdateArray();
     * console.log('Values for update:', updateArray);
     */
    getUpdateArray() {
      var updateArray = [];
      var {headers} = this.constructor.getTableInfo();
  
      headers.forEach((header) => {
        var propertyInfo = this[header];

        if(this.constructor.isColumn(propertyInfo)) {
            updateArray.push(propertyInfo._value);
        }
      });
      return updateArray;
    }
  
    /**
     * Checks if required properties have values in the entity.
     * @param {Array} headers - An array of property names to check.
     * @param {Array} updateArray - An array of property values for update.
     * @returns {Array} - An array of property names that are required but missing values.
     *
     * @description This method checks if required properties in the entity have values assigned.
     * It takes an array of property names to check and an array of property values prepared for
     * an update operation. It returns an array of property names that are required but do not
     * have values in the update array.
     *
     * @param {Array} headers - An array of property names to check.
     * @param {Array} updateArray - An array of property values for update.
     * @returns {Array} - An array of property names that are required but missing values.
     *
     * @example
     * const entity = MyTable.findById('ABC123');
     * const headers = ['Name', 'Age', 'City'];
     * const updateArray = [ 'Alice', 28, 'New York' ];
     * const missingRequired = entity.checkRequired(headers, updateArray); //length === 0
     * console.log('Missing required properties:', missingRequired);
     */
    checkRequired(headers, updateArray) {
      var wrongs = [];
      for(let i = 0; i < headers.length; i++) {
        let header = headers[i];
        let element = updateArray[i];
  
        if(this[header]._required && (typeof element === "undefined" || element === "")) {
          wrongs.push(header);
        };
      }
      return wrongs;
    }
  
    /**
     * Persists changes made to the entity in the data source.
     *
     * @description This method is used to persist changes made to the entity associated with
     * the expanded class by `GSTable` to the data source, a Google Sheets table. It updates
     * the modified timestamp and the last modified by user, assigns an ID if needed, and
     * adds or updates the entity's data in the data source.
     *
     * @throws {Error} If required properties have missing values.
     *
     * @example
     * const entity = new MyTable();
     * entity.setValue('Name', 'Alice');
     * entity.setValue('Age', 28);
     * entity.persist();
     */
    persist() {
      var {sheet, headers} = this.constructor.getTableInfo();
  
      this.modified._value = new Date();
      var active_user = Session.getActiveUser();
      if(active_user !== null) this.last_modified_by._value = active_user.getEmail();
  
      var updateArray = [...this.getUpdateArray()];
  
      if (this.id._value === "") {
        var newEntityProps = {
          id: this.constructor.generateId(8),
          created: this.modified._value,
          created_by: this.last_modified_by._value
        }
        Object.keys(newEntityProps).forEach((prop) => {
          var pos = headers.indexOf(prop);
          updateArray[pos] = this[prop]._value = newEntityProps[prop];
        });
        var wrongs = this.checkRequired(headers, updateArray);
        if(wrongs.length > 0) {
          throw new Error("'" + wrongs.join('\', \'') + "' are marked as 'required'");
        }
        sheet.appendRow(updateArray);
        this.row_number = sheet.getLastRow();
      } else if(this.row_number > 0) {
        var wrongs = this.checkRequired(headers, updateArray);
        if(wrongs.length > 0) {
          throw new Error("'" + wrongs.join('\', \'') + "' are marked as 'required'");
        }
        sheet.getRange(this.row_number, 1, 1, sheet.getLastColumn()).setValues([updateArray]);
      }
  
      SpreadsheetApp.flush();
    }
  
    /**
     * Removes the entity from the data source.
     *
     * @description This method is used to remove the entity associated with the expanded
     * class by `GSTable` from the data source, a Google Sheets table. It deletes the 
     * entity's data from the data source and resets the entity's row number to indicate
     * removal.
     *
     * @example
     * const entity = MyTable.findById('ABC123');
     * entity.remove();
     */
    remove() {
      if (this.row_number === 0) return;
  
      var {sheet} = this.constructor.getTableInfo();
      sheet.getRange(this.row_number, 1, 1, sheet.getLastColumn()).deleteCells(SpreadsheetApp.Dimension.ROWS);
  
      this.row_number = 0;
  
      SpreadsheetApp.flush();
    }
  
    /**
     * Expands properties with foreign key references in the entity.
     *
     * @description This method is used to expand properties within the entity associated with
     * the extended class by`GSTable` that have foreign key references. It loads and associates 
     * related entities based on the foreign key values, enhancing the entity's data with 
     * detailed information from related entities.
     *
     * @example
     * const entity = MyTable.findById('ABC123');
     * entity.expand();
     */
    expand() {
      var properties = Object.getOwnPropertyNames(this);
  
      properties.forEach((prop) => {
        var propertyInfo = this[prop];
        if(this.constructor.isColumn(propertyInfo) && propertyInfo.hasOwnProperty("_class")) {
          this[prop + "_"] = propertyInfo._class.findById(propertyInfo._value);
        }
      })
    }
  
    /**
     * Converts the entity into a simplified JavaScript object.
     * @returns {Object} - A simplified JavaScript object representing the entity.
     *
     * @description This method is used to convert the entity associated with the class 
     * extended by `GSTable` into a simplified JavaScript object. The resulting object 
     * includes property-value pairs from the entity, making it suitable for serialization 
     * and stringification or easier inspection of entity data.
     *
     * @returns {Object} - A simplified JavaScript object representing the entity.
     *
     * @example
     * const entity = MyTable.findById('ABC123');
     * const simpleObject = entity.toSimpleObject();
     * console.log('Simplified entity:', simpleObject);
     */
    toSimpleOjbect(extendWith = null) {
      var plainObj = {};
      var toStringify = this;
      var properties = Object.getOwnPropertyNames(this);
  
      properties.forEach((property) => {
        var propertyInfo = toStringify[property];
        if(this.constructor.isColumn(propertyInfo)) {
          plainObj[property] = propertyInfo._value;
        } else if(propertyInfo instanceof GSTable) {
          plainObj[property] = propertyInfo.toSimpleOjbect();
        }
      })
      return this.objectExtension(plainObj, extendWith);
    }
  
    /**
     * Extends the simpleObject with custom properties overwritten in the extended class.
     * @param {Object} simpleObject - The object to extend.
     * @param {any} extendWith - An object or an array to use to extend.
     * @returns {Object} - A simplified JavaScript object representing the entity with other properties.
     *
     * @description This method is used to add properties to the simpleObject. Override it on the class 
     * extended by `GSTable` and add your preferred properties. The resulting object 
     * includes property-value pairs from the entity, making it suitable for serialization 
     * and stringification or easier inspection of entity data.
     *
     * @returns {Object} - A simplified JavaScript object representing the entity.
     *
     * @example
     * const entity = MyTable.findById('ABC123');
     * const simpleObject = entity.toSimpleObject();
     * console.log('Simplified entity:', simpleObject);
     */
    objectExtension(simpleObject, extendWith = null) {
      return simpleObject;
    }
  
    /**
     * Converts the entity into a JSON string representation.
     * @returns {string} - A JSON string representing the entity's data.
     *
     * @description This method is used to convert the entity associated with the class 
     * extended by `GSTable` into a JSON string representation. The resulting JSON string 
     * includes property-value pairs from the entity, suitable for serialization or display.
     *
     * @returns {string} - A JSON string representing the entity's data.
     *
     * @example
     * const entity = MyTable.findById('ABC123');
     * const jsonString = entity.toString();
     * console.log('Entity as JSON:', jsonString);
     */
    toString() {
      return JSON.stringify(this.toSimpleOjbect(), null, 2);
    }
  
    /**
     * Logs the JSON representation of the entity to the console.
     *
     * @description This method is used to log the JSON representation of the entity associated
     * with the class extended by `GSTable` to the console. It provides a convenient way to 
     * inspect the entity's data in a human-readable format.
     *
     * @example
     * const entity = MyTable.findById('ABC123');
     * entity.print();
     */
    print() {
      Logger.log(this.toString());
    }
}
