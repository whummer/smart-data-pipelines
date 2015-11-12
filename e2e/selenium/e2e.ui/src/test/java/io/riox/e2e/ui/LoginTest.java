package io.riox.e2e.ui;

import static org.junit.Assert.assertNotNull;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Tests the login functionality.
 */
public class LoginTest extends AbstractProxyTest {


	@Test
	public void testLogin() throws InterruptedException {
				
		driver.get(rioxUrl);

		WebElement loginField = new WebDriverWait(driver, 30)
				  .until(ExpectedConditions.presenceOfElementLocated(By.linkText("Login")));
		loginField.click();

		WebElement emailField = new WebDriverWait(driver, 10)
		  .until(ExpectedConditions.presenceOfElementLocated(By.name("email")));
		emailField.sendKeys(Constants.TEST_FR_EMAIL);

		WebElement passwordField = new WebDriverWait(driver, 10)
		  .until(ExpectedConditions.presenceOfElementLocated(By.name("password")));
				passwordField.sendKeys(Constants.TEST_FR_PASS);

		WebElement loginBox = driver.findElement(By.name("form1"));
		loginBox.submit();

		WebElement logoutField = new WebDriverWait(driver, 10)
		  .until(ExpectedConditions.presenceOfElementLocated(By.partialLinkText(Constants.TEST_FR_NAME)));
		assertNotNull(logoutField);

		driver.quit();
	}

}
