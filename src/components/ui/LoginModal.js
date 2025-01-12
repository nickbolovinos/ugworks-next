import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function LoginModal({ show, onClose, onLogin, onSignup }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isSignup, setIsSignup] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();

		if (isSignup) {
			onSignup({ email }); // Pass email only for signup
		} else {
			onLogin({ email, password }); // Pass both email and password for login
		}

		// Clear fields after submission
		setEmail('');
		setPassword('');
		onClose(); // Close the modal after submission
	};

	return (
		<Modal id="loginModal" show={show} onHide={onClose}>
			<Modal.Header closeButton>
				<Modal.Title>{isSignup ? 'Create Account' : 'Login'}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={handleSubmit}>
					<Form.Group controlId="formBasicEmail">
						<Form.Label>Email Address</Form.Label>
						<Form.Control
							type="email"
							placeholder="Enter email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</Form.Group>

					{!isSignup && (
						<Form.Group controlId="formBasicPassword">
							<Form.Label>Password</Form.Label>
							<Form.Control
								type="password"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</Form.Group>
					)}
					<Button variant="primary" type="submit">
						{isSignup ? 'Sign Up' : 'Login'}
					</Button>
				</Form>
			</Modal.Body>

			<Modal.Footer>
				<Button variant="link" onClick={() => setIsSignup(!isSignup)}>
					{isSignup ? 'Login instead' : 'Create Account'}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default LoginModal;