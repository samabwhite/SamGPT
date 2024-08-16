function Register() {
    function signIn() {
        return;
    }

    return (
        <form action={signIn}>
            <input type="text" name="username" id="username_input" placeholder="Name" minLength="2" maxLength="20" required/>
            <input type="text" name="email" id="email_input" placeholder="Email" minLength="3" required/>
            <input type="text" name="password" id="password_input" placeholder="Password" minLength="3" maxLength="20" required/>
            <button type="submit">Submit</button>
        </form>
    );
}

export default Register;