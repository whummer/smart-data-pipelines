package io.riox.e2e.ui;

import static org.junit.Assert.*;
import static io.riox.e2e.ui.Constants.*;

import java.util.UUID;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Tests the signup functionality.
 *
 * @author Waldemar Hummer
 * @author riox
 */
public class SignupTest extends AbstractProxyTest {


	@Test
	public void testSignup() throws InterruptedException {
		log.info("Starting testSignup() ...");

		// we only have a basic auth challenge in our staging environment
		if (isStagingEnv()) {
			String basicAuthUrl = rioxUrl.replace("http://", "http://riox:rioxRocks!@") + "/#/signup";
			driver.get(basicAuthUrl);
			log.info("basicAuth done...");
		} else {

			driver.get(rioxUrl);

			WebElement signupField = new WebDriverWait(driver, TIMEOUT_LONG)
				.until(ExpectedConditions.elementToBeClickable(By.linkText("Sign up")));
			signupField.click();
			log.info("signupField clicked...");
		}

		WebElement firstNameField = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.visibilityOfElementLocated(By.name("firstname")));
		firstNameField.sendKeys("firstname");
		log.info("firstNameField entered...");

		WebElement lastNameField = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.visibilityOfElementLocated(By.name("lastname")));
		lastNameField.sendKeys("lastname");
		log.info("lastNameField entered...");

		WebElement emailField = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.visibilityOfElementLocated(By.name("email")));
		emailField.sendKeys(UUID.randomUUID().toString() + "@example.com");
		log.info("emailField entered...");

		WebElement passwordField = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.visibilityOfElementLocated(By.name("password")));
		passwordField.sendKeys("test123");
		log.info("passwordField entered...");

		WebElement form = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.visibilityOfElementLocated(By.name("formSignup")));
		form.submit();
		log.info("formSignup submitted...");

		/* EXPECT THE SIGNUP TO FAIL (missing organization) */
		WebElement helpOrganization = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.presenceOfElementLocated(By.id("helpOrganization")));
		assertTrue(helpOrganization.getText().contains("Please enter your organization name."));

		/* PROVIDE MISSING INFORMATION */
		WebElement orgField = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.visibilityOfElementLocated(By.name("organization")));
		orgField.sendKeys("Test_Organization");
		log.info("orgField entered...");

		form = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.presenceOfElementLocated(By.name("formSignup")));
		form.submit();
		log.info("formSignup entered...");

		/* EXPECT THE SIGNUP TO SUCCEED */
		WebElement result = new WebDriverWait(driver, TIMEOUT_SHORT)
			.until(ExpectedConditions.visibilityOfElementLocated(By.className("modal-body")));
		assertTrue(result.getText().contains("Your new account has been created!"));
		log.info("testSignup() finished");

		driver.quit();
	}

}
