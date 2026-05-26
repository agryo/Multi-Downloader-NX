import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import React from 'react';
import { messageChannelContext } from '../provider/MessageChannel';
import Require from './Require';
import { useSnackbar } from 'notistack';

const AuthButton: React.FC = () => {
	const snackbar = useSnackbar();

	const [open, setOpen] = React.useState(false);

	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');

	const [usernameError, setUsernameError] = React.useState(false);
	const [passwordError, setPasswordError] = React.useState(false);

	const messageChannel = React.useContext(messageChannelContext);

	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<Error | undefined>(undefined);
	const [authed, setAuthed] = React.useState(false);

	const checkAuth = async () => {
		setAuthed((await messageChannel?.checkToken())?.isOk ?? false);
	};

	React.useEffect(() => {
		checkAuth();
	}, []);

	const handleSubmit = async () => {
		if (!messageChannel) throw new Error('Invalid state'); //The components to confirm only render if the messageChannel is not undefinded
		if (username.trim().length === 0) return setUsernameError(true);
		if (password.trim().length === 0) return setPasswordError(true);
		setUsernameError(false);
		setPasswordError(false);
		setLoading(true);

		const res = await messageChannel.auth({ username, password });
		if (res.isOk) {
			setOpen(false);
			snackbar.enqueueSnackbar('Login realizado com sucesso', {
				variant: 'success'
			});
			setUsername('');
			setPassword('');
		} else {
			setError(res.reason);
		}
		await checkAuth();
		setLoading(false);
	};

	return (
		<Require value={messageChannel}>
			<Dialog open={open}>
				<Dialog open={!!error}>
					<DialogTitle>Erro durante a Autenticação</DialogTitle>
					<DialogContentText>
						{error?.name}
						{error?.message}
					</DialogContentText>
					<DialogActions>
						<Button onClick={() => setError(undefined)}>Fechar</Button>
					</DialogActions>
				</Dialog>
				<DialogTitle sx={{ flexGrow: 1 }}>Autenticação</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Aqui, você precisa inserir seu nome de usuário (provavelmente seu e-mail) e sua senha.
						<br />
						Essas informações não são armazenadas em nenhum lugar e são usadas apenas para autenticação única no serviço.
					</DialogContentText>
					<TextField
						error={usernameError}
						helperText={usernameError ? 'Por favor, insira o usuário' : undefined}
						margin="dense"
						id="username"
						label="Usuário / E-mail"
						type="text"
						fullWidth
						variant="standard"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						disabled={loading}
					/>
					<TextField
						error={passwordError}
						helperText={passwordError ? 'Por favor, insira a senha' : undefined}
						margin="dense"
						id="password"
						label="Senha"
						type="password"
						fullWidth
						variant="standard"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						disabled={loading}
					/>
				</DialogContent>
				<DialogActions>
					{loading && <CircularProgress size={30} />}
					<Button disabled={loading} onClick={() => setOpen(false)}>
						Fechar
					</Button>
					<Button disabled={loading} onClick={() => handleSubmit()}>
						Autenticar
					</Button>
				</DialogActions>
			</Dialog>
			<Button startIcon={authed ? <Check /> : <Close />} variant="contained" onClick={() => setOpen(true)}>
				Autenticar
			</Button>
		</Require>
	);
};

export default AuthButton;
