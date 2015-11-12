package io.riox.e2e.ui;

import static org.junit.Assert.assertNotNull;
import static io.riox.e2e.ui.Constants.*;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Tests the login functionality.
 * @author riox
 */
public class LoginTest extends AbstractProxyTest {


	@Test
	public void testLogin() throws InterruptedException {

		driver.get(rioxUrl);

		// NOTE: we have two login elements - we need to match one only otherwise
		// we get an "element not visible" exception
		WebElement loginField = new WebDriverWait(driver, TIMEOUT_LONG)
			.until(ExpectedConditions.presenceOfElementLocated(By.xpath(
					// "//*[@ui-sref=\"index.login\"]" // this maches two --> BAD
					"//*[@class=\"navLinks\"]//a[@ui-sref=\"index.login\"]"
			)));
		loginField.click();

		WebElement emailField = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.presenceOfElementLocated(By.name("email")));
		emailField.sendKeys(TEST_FR_EMAIL);

		WebElement passwordField = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.presenceOfElementLocated(By.name("password")));
		passwordField.sendKeys(TEST_FR_PASS);

		WebElement loginBox = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.presenceOfElementLocated(By.name("form1")));
		loginBox.submit();

		WebElement logoutField = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.presenceOfElementLocated(By.partialLinkText(TEST_FR_NAME)));
		assertNotNull(logoutField);

		driver.quit();
	}

}
