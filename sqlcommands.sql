-- Create New User and Grant Privileges
--
CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON inevent.* TO 'newuser'@'localhost';
REVOKE ALL PRIVILEGES ON inevent.* FROM 'newuser'@'localhost';

CREATE DATABASE IF NOT EXISTS db_inevent CHARSET = utf8 COLLATE = utf8_general_ci;

ALTER DATABASE db_inevent CHARACTER SET = 'latin1'  COLLATE = 'latin1_swedish_ci';

-- Backup database
--
mysqldump -u root -p --all-databases --skip-lock-tables > alldb.sql
mysqldump --all-databases -u root -p > dump-$( date '+%Y-%m-%d_%H-%M-%S' ).sql
mysqldump --skip-lock-tables -u root -p db_name  > db_name.sql

-- restore database
mysql -u dnelub -p db_inevent< /home/dnelub/Documents/inevent.sql
mysqldump --skip-lock-tables -u dnelub -p db_inevent  >  /home/dnelub/Documents/inevent-$( date '+%Y-%m-%d_%H-%M-%S' ).sql

CREATE TABLE milestones(
    milestone_id int auto_increment,
    project_id int,
    milestone varchar(255) not null,
    start_date date not null,
    end_date datetime DEFAULT NOW(),
    completed bool default false,
    cost decimal(15,2) not null,
    primary key(milestone_id),
    foreign key(project_id)
        references customers(customerNumber)
)  ENGINE=InnoDB DEFAULT CHARSET=utf8;


--Duplicating a MySQL table, indices, and data

CREATE TABLE newtable LIKE oldtable;
INSERT INTO newtable SELECT * FROM oldtable;

DROP TABLE tableName

--alter table
ALTER TABLE `people`
  ADD PRIMARY KEY (`person_id`);

ALTER TABLE milestones
  ADD CONSTRAINT FOREIGN KEY (project_id)
   REFERENCES customers (customerNumber);

CREATE INDEX index_name
on table_name(column_list);

ALTER TABLE websites
  ADD new_coloumn_name varchar(20)
    AFTER server_name,
  ADD new_coloumn_name2 date;

ALTER TABLE table_name
  DROP COLUMN column_name;

ALTER TABLE websites
  MODIFY host_name varchar(50);






DROP PROCEDURE IF EXISTS `sp_GetRecordID`;
DELIMITER //

CREATE PROCEDURE `sp_GetRecordID`(
  `tablename_In` VARCHAR(64),
  `formSecret_In` VARCHAR(32),
  OUT `id_Out` BIGINT UNSIGNED
)
BEGIN
  SET @`query` := CONCAT('SELECT `id` INTO @`id_Out`
                          FROM ', `tablename_In` ,'
                          WHERE `formSecret` = \'', `formSecret_In`, '\'');
  PREPARE `stmt` FROM @`query`;
  EXECUTE `stmt`;
  SET `id_Out` := @`id_Out`,
       @`query` := NULL;
  DEALLOCATE PREPARE `stmt`;
END//

DELIMITER ;


DELIMITER $$
DROP FUNCTION IF EXISTS inevent.AGE_C $$
CREATE FUNCTION AGE_C(bod DATE) RETURNS decimal(10,2)
BEGIN
DECLARE ageyear FLOAT;
SELECT (DATEDIFF(NOW(),bod)/365) INTO ageyear;
RETURN ageyear;
END $$
DELIMITER ;

DELIMITER $$
DROP FUNCTION IF EXISTS inevent.AGE_C $$
CREATE FUNCTION AGE_C(field_idf INT, user_idf INT) RETURNS varchar(30)
BEGIN
DECLARE field_value varchar(30);
SELECT (value_field) INTO field_value FROM db_test.tb_field_user AS fu
WHERE fu.field_id=field_idf AND fu.user_id=user_idf;
RETURN field_value;
END $$
DELIMITER ;



SELECT u.firstname, u.lastname, fu.value_field AS city
FROM tb_field_user as fu
INNER JOIN tb_fields AS f
ON(f.field_id=fu.field_id)
INNER JOIN tb_users AS u
ON(u.user_id=fu.user_id)
WHERE fu.field_ID=1;



CREATE TRIGGER increment_animal
AFTER INSERT ON animals
FOR EACH ROW
UPDATE animal_count SET animal_count.animals = animal_count.animals+1;



SELECT customerNumber, orderDate
FROM orders
WHERE orderDate IN
(SELECT MIN(orderDate)
 FROM orders
 );

SELECT customerNumber, orderDate, AGE_C(orderDate) as age
FROM orders
WHERE orderDate IN
(SELECT orderDate
 FROM orders
 ORDER BY orderDate ASC
 )
 LIMIT 10;

SELECT customerNumber, orderDate
FROM () sq
Where

SELECT DATEDIFF(CURDATE(), '2014-05-19');

SELECT customerNumber, count(*) as cnum
FROM `orders`
GROUP BY customerNumber
HAVING cnum>2
ORDER BY cnum DESC;


INSERT INTO TABLE_NAME(column_list)
values(value_list);




UPDATE TABLE_NAME
SET column1 = value1,
    column2 = value2,
    ...
[where search_condition];





DROP PROCEDURE IF EXISTS proc_cursor_to_loopAndInsert;
DELIMITER ;;
CREATE PROCEDURE proc_cursor_to_loopAndInsert()
BEGIN
  DECLARE CURSOR_STUDENT_ID INT;
  DECLARE CURSOR_ENROLL_DATE DATE;
  DECLARE done INT DEFAULT FALSE;
  DECLARE cursor_studentEnrollDate CURSOR FOR SELECT student_id, enroll_date FROM student_enroll_date;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  OPEN cursor_studentEnrollDate;
  loop_through_rows: LOOP
    FETCH cursor_studentEnrollDate INTO CURSOR_STUDENT_ID,CURSOR_ENROLL_DATE;
    IF done THEN
      LEAVE loop_through_rows;
    END IF;
    INSERT INTO student_enroll_date_duplicate(student_id,enroll_date,duplicate_flag) VALUES(CURSOR_STUDENT_ID,CURSOR_ENROLL_DATE,TRUE);
  END LOOP;
  CLOSE cursor_studentEnrollDate;
END;
;;


DROP PROCEDURE IF EXISTS insertAge;
DELIMITER ;;
CREATE PROCEDURE insertAge(
IN customerN INT)
BEGIN
  DECLARE bod DATE;
  DECLARE agec decimal(10,2);
  SELECT MIN(orders.orderDate) INTO bod FROM orders WHERE orders.customerNumber=customerN;
  UPDATE orders SET orders.age=AGE_C(bod)
  WHERE orders.customerNumber=customerN;
END
;;

DROP PROCEDURE IF EXISTS insertAgeCat;
DELIMITER ;;
CREATE PROCEDURE insertAgeCat(
IN customerN INT)
BEGIN
  DECLARE bod DATE;
  DECLARE agec decimal(10,2);
  SELECT MIN(orders.orderDate) INTO bod FROM orders WHERE orders.customerNumber=customerN;
  SELECT AGE_C(bod) INTO agec;
  IF agec > 18 THEN
	UPDATE orders SET orders.age=agec, cat_age='adult'
	WHERE orders.customerNumber=customerN;
  ELSEIF 16<agec<18 THEN
	UPDATE orders SET orders.age=agec, cat_age='middle'
	WHERE orders.customerNumber=customerN;
  ELSE
	UPDATE orders SET orders.age=agec, cat_age='young'
	WHERE orders.customerNumber=customerN;
  END IF;
END
;;


DROP PROCEDURE IF EXISTS insertAllTable;
DELIMITER ;;
CREATE PROCEDURE insertAllTable()
BEGIN
  DECLARE customerN INT;
  DECLARE done INT DEFAULT FALSE;
  DECLARE cursor_orderTables CURSOR FOR SELECT orders.customerNumber FROM orders;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  OPEN cursor_orderTables;
  loop_through_rows: LOOP
    FETCH cursor_orderTables INTO customerN;
    IF done THEN
      LEAVE loop_through_rows;
    END IF;
    CALL insertAgeCat(customerN);
  END LOOP;
  CLOSE cursor_orderTables;
END;
;;
