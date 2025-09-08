-- This SQL script creates or updates the 'notes' table in the 'dashboard_db' database.

-- First, create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS `dashboard_db`.`notes` (
    `note` TEXT NULL DEFAULT NULL,
    `color` INT NOT NULL DEFAULT '0',
    `time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `user` INT NULL DEFAULT NULL
) ENGINE = InnoDB;

-- Then, add the ID column if it doesn't exist (this will fail silently if column already exists)
-- Note: You may need to run this separately as MySQL doesn't have "ADD COLUMN IF NOT EXISTS"
ALTER TABLE `dashboard_db`.`notes` 
ADD COLUMN `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST;

-- Insert test data for testing
INSERT INTO `dashboard_db`.`notes` (`note`, `color`, `user`) VALUES 
('This is my first test note', 1, 1),
('Another test note for debugging', 2, 1),
('Meeting notes: Discuss project timeline', 3, 2),
('Shopping list: Milk, Bread, Eggs', 1, 1),
('Important reminder: Submit report by Friday', 4, 2);
