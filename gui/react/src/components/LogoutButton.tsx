import { ExitToApp } from '@mui/icons-material';
import { Button } from '@mui/material';
import React from 'react';
import useStore from '../hooks/useStore';
import { messageChannelContext } from '../provider/MessageChannel';
import Require from './Require';

const LogoutButton: React.FC = () => {
	const messageChannel = React.useContext(messageChannelContext);
	const [, dispatch] = useStore();

	const logout = async () => {
		if (await messageChannel?.isDownloading()) return alert('Você está realizando um download no momento. Por favor, aguarde o término primeiro.');
		if (await messageChannel?.logout())
			dispatch({
				type: 'service',
				payload: undefined
			});
		else alert('Não foi possível alterar o serviço');
	};

	return (
		<Require value={messageChannel}>
			<Button startIcon={<ExitToApp />} variant="contained" onClick={logout} sx={{ maxHeight: '2.3rem' }}>
				Trocar Serviço
			</Button>
		</Require>
	);
};

export default LogoutButton;
