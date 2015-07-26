package io.riox.e2e.ui;

import static org.junit.Assert.*;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

/**
 * Tests the login functionality.
 */
public class LoginTest extends AbstractProxyTest {
	
	@Test
	public void testLogin() throws InterruptedException {
		
		driver.get(rioxUrl);
		Thread.sleep(7000); // Let the user actually see something!

		WebElement loginField = driver.findElement(By.linkText("Login"));
		loginField.click();
		
		Thread.sleep(5000); // Let the user actually see something!

		WebElement emailField = driver.findElement(By.name("email"));
		emailField.sendKeys("om@riox.io");

		WebElement passwordField = driver.findElement(By.name("password"));
		passwordField.sendKeys("test123");

		WebElement loginBox = driver.findElement(By.name("form1"));
		loginBox.submit();
				
		Thread.sleep(5000); // Let the user actually see something!

		WebElement logoutField = driver.findElement(By.partialLinkText("F.R."));	
		assertNotNull(logoutField);
		
		driver.quit();
	}

}
