
function SignIn() {
    function signIn() {
        return;
    }

    return (
        <form action={signIn}>
            <input type="text" name="email" id="user_email_input" placeholder="Email" required/>
            <input type="text" name="password" id="user_password_input" placeholder="Password" required/>
            <button type="submit">Submit</button>
        </form>
    );
}

export default SignIn;