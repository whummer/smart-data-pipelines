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
 */
public class LoginTest extends AbstractProxyTest {

	@Test
	public void testLogin() throws InterruptedException {
		log.info("Starting testLogin() ...");

		driver.get(rioxUrl);

		// NOTE: we have two login elements - we need to match one only otherwise
		// we get an "element not visible" exception
		WebElement loginField = new WebDriverWait(driver, TIMEOUT_LONG)
			.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(
					// "//*[@ui-sref=\"index.login\"]" // this maches two --> BAD
					"//*[@class=\"navLinks\"]//a[@ui-sref=\"index.login\"]"
			)));
		loginField.click();

		log.info("Login clicked...");

		WebElement emailField = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.visibilityOfElementLocated(By.name("email")));
		emailField.sendKeys(TEST_OM_EMAIL);

		log.info("Email entered...");

		WebElement passwordField = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.visibilityOfElementLocated(By.name("password")));
		passwordField.sendKeys(TEST_OM_PASS);

		log.info("Password entered...");

		WebElement loginBox = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.presenceOfElementLocated(By.name("form1")));
		loginBox.submit();

		log.info("Form submitted...");

		WebElement logoutField = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.presenceOfElementLocated(By.partialLinkText(TEST_OM_NAME)));

		log.info("Logout link found...");

		assertNotNull(logoutField);

		driver.quit();
		log.info("Finished testLogin()");

	}

}
