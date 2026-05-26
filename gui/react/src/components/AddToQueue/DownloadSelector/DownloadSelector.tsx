import React from 'react';
import { Box, Button, Divider, FormControl, InputBase, InputLabel, Link, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material';
import useStore from '../../../hooks/useStore';
import MultiSelect from '../../reusable/MultiSelect';
import { messageChannelContext } from '../../../provider/MessageChannel';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbar } from 'notistack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

type DownloadSelectorProps = {
	onFinish?: () => unknown;
};

const DownloadSelector: React.FC<DownloadSelectorProps> = ({ onFinish }) => {
	const messageHandler = React.useContext(messageChannelContext);
	const [store, dispatch] = useStore();
	const [availableDubs, setAvailableDubs] = React.useState<string[]>([]);
	const [availableSubs, setAvailableSubs] = React.useState<string[]>([]);
	const [loading, setLoading] = React.useState(false);
	const { enqueueSnackbar } = useSnackbar();
	const ITEM_HEIGHT = 48;
	const ITEM_PADDING_TOP = 8;

	React.useEffect(() => {
		if (messageHandler) {
			(async () => {
				// Primeiro, carregamos os idiomas disponíveis para o serviço
				const [dubs, subs] = await Promise.all([messageHandler.availableDubCodes(), messageHandler.availableSubCodes()]);
				setAvailableDubs(dubs ?? []);
				setAvailableSubs(subs ?? []);

				// Depois, buscamos os padrões do cli-defaults.yml
				const result = await Promise.all([
					messageHandler.handleDefault('dubLang'),
					messageHandler.handleDefault('dlsubs'),
					messageHandler.handleDefault('q'),
					messageHandler.handleDefault('fileName'),
					messageHandler.handleDefault('dlVideoOnce')
				]);

				dispatch({
					type: 'downloadOptions',
					payload: {
						...store.downloadOptions,
						dubLang: Array.isArray(result[0]) ? result[0] : [],
						dlsubs: Array.isArray(result[1]) ? result[1] : [],
						q: result[2] ?? 0,
						fileName: result[3] ?? '',
						dlVideoOnce: !!result[4]
					}
				});
			})();
		}
	}, [messageHandler]);

	const addToQueue = async () => {
		setLoading(true);
		const res = await messageHandler?.resolveItems(store.downloadOptions);
		if (!res)
			return enqueueSnackbar('A requisição falhou. Por favor, verifique se o ID está correto.', {
				variant: 'error'
			});
		setLoading(false);
		if (onFinish) onFinish();
	};

	const listEpisodes = async () => {
		if (!store.downloadOptions.id) {
			return enqueueSnackbar('Por favor, insira um ID', {
				variant: 'error'
			});
		}
		setLoading(true);
		const res = await messageHandler?.listEpisodes(store.downloadOptions.id);
		if (!res || !res.isOk) {
			setLoading(false);
			return enqueueSnackbar('A requisição falhou. Por favor, verifique se o ID está correto.', {
				variant: 'error'
			});
		} else {
			dispatch({
				type: 'episodeListing',
				payload: res.value
			});
		}
		setLoading(false);
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '5px' }}>
				<Box
					sx={{
						width: '50rem',
						height: '21rem',
						margin: '10px',
						display: 'flex',
						justifyContent: 'space-between'
						//backgroundColor: '#ffffff30',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: '0.7rem'
							//backgroundColor: '#ff000030'
						}}
					>
						<Typography sx={{ fontSize: '1.4rem' }}>Configurações Gerais</Typography>
						<TextField
							value={store.downloadOptions.id ?? ''}
							required
							onChange={(e) => {
								dispatch({
									type: 'downloadOptions',
									payload: { ...store.downloadOptions, id: e.target.value }
								});
							}}
							label="ID da Obra"
						/>
						<TextField
							type="number"
							value={store.downloadOptions.q ?? 0}
							required
							onChange={(e) => {
								const parsed = parseInt(e.target.value);
								if (isNaN(parsed) || parsed < 0 || parsed > 10) return;
								dispatch({
									type: 'downloadOptions',
									payload: { ...store.downloadOptions, q: parsed }
								});
							}}
							label="Qualidade (0 para máx)"
						/>
						<Box sx={{ display: 'flex', gap: '5px' }}>
							<Button
								sx={{ textTransform: 'none' }}
								onClick={() => dispatch({ type: 'downloadOptions', payload: { ...store.downloadOptions, noaudio: !store.downloadOptions.noaudio } })}
								variant={store.downloadOptions.noaudio ? 'contained' : 'outlined'}
							>
								Pular Áudio
							</Button>
							<Button
								sx={{ textTransform: 'none' }}
								onClick={() => dispatch({ type: 'downloadOptions', payload: { ...store.downloadOptions, novids: !store.downloadOptions.novids } })}
								variant={store.downloadOptions.novids ? 'contained' : 'outlined'}
							>
								Pular Vídeo
							</Button>
						</Box>
						<Button
							sx={{ textTransform: 'none' }}
							onClick={() => dispatch({ type: 'downloadOptions', payload: { ...store.downloadOptions, dlVideoOnce: !store.downloadOptions.dlVideoOnce } })}
							variant={store.downloadOptions.dlVideoOnce ? 'contained' : 'outlined'}
						>
							Pular Desnecessários
						</Button>
						<Tooltip title={store.service == 'hidive' ? '' : <Typography>Simulcast é suportado apenas no Hidive</Typography>} arrow placement="top">
							<Box>
								<Button
									sx={{ textTransform: 'none' }}
									disabled={store.service != 'hidive'}
									onClick={() => dispatch({ type: 'downloadOptions', payload: { ...store.downloadOptions, simul: !store.downloadOptions.simul } })}
									variant={store.downloadOptions.simul ? 'contained' : 'outlined'}
								>
									Baixar ver. Simulcast
								</Button>
							</Box>
						</Tooltip>
					</Box>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: '0.7rem'
							//backgroundColor: '#00000020'
						}}
					>
						<Typography sx={{ fontSize: '1.4rem' }}>Opções de Episódio</Typography>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								gap: '1px'
							}}
						>
							<Box
								sx={{
									borderColor: '#595959',
									borderStyle: 'solid',
									borderWidth: '1px',
									borderRadius: '5px',
									//backgroundColor: '#ff4567',
									width: '15rem',
									height: '3.5rem',
									display: 'flex',
									'&:hover': {
										borderColor: '#ffffff'
									}
								}}
							>
								<InputBase
									sx={{
										ml: 2,
										flex: 1
									}}
									disabled={store.downloadOptions.all}
									value={store.downloadOptions.e ?? ''}
									required
									onChange={(e) => {
										dispatch({
											type: 'downloadOptions',
											payload: { ...store.downloadOptions, e: e.target.value }
										});
									}}
									placeholder="Ex: 1-5, 8, S1"
								/>
								<Divider orientation="vertical" />
								<LoadingButton
									loading={loading}
									disableElevation
									disableFocusRipple
									disableRipple
									disableTouchRipple
									onClick={listEpisodes}
									variant="text"
									sx={{ textTransform: 'none' }}
								>
									<Typography sx={{ fontWeight: 'bold' }}>
										Listar
										<br />
										Episódios
									</Typography>
								</LoadingButton>
							</Box>
						</Box>
						<Button
							sx={{ textTransform: 'none' }}
							onClick={() => dispatch({ type: 'downloadOptions', payload: { ...store.downloadOptions, all: !store.downloadOptions.all } })}
							variant={store.downloadOptions.all ? 'contained' : 'outlined'}
						>
							Baixar Tudo
						</Button>
						<Button
							sx={{ textTransform: 'none' }}
							onClick={() => dispatch({ type: 'downloadOptions', payload: { ...store.downloadOptions, but: !store.downloadOptions.but } })}
							variant={store.downloadOptions.but ? 'contained' : 'outlined'}
						>
							Baixar Tudo, exceto
						</Button>
					</Box>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: '0.7rem'
							//backgroundColor: '#00ff0020'
						}}
					>
						<Typography sx={{ fontSize: '1.4rem' }}>Opções de Idioma</Typography>
						<MultiSelect
							title="Idiomas de Áudio"
							values={availableDubs}
							selected={store.downloadOptions.dubLang}
							onChange={(e) => {
								dispatch({
									type: 'downloadOptions',
									payload: { ...store.downloadOptions, dubLang: e }
								});
							}}
							allOption
						/>

						<MultiSelect
							title="Idiomas de Legenda"
							values={availableSubs}
							selected={store.downloadOptions.dlsubs}
							onChange={(e) => {
								dispatch({
									type: 'downloadOptions',
									payload: { ...store.downloadOptions, dlsubs: e }
								});
							}}
						/>
						<Tooltip title={store.service == 'crunchy' ? '' : <Typography>Hardsubs são suportados apenas na Crunchyroll</Typography>} arrow placement="top">
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									width: '100%',
									gap: '1rem'
								}}
							>
								<Box
									sx={{
										borderRadius: '5px',
										//backgroundColor: '#ff4567',
										width: '15rem',
										height: '3.5rem',
										display: 'flex'
									}}
								>
									<FormControl fullWidth>
										<InputLabel id="hsLabel">Idioma do Hardsub</InputLabel>
										<Select
											MenuProps={{
												PaperProps: {
													style: {
														maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
														width: 250
													}
												}
											}}
											labelId="hsLabel"
											label="Legenda Fixa (Hardsub)"
											disabled={store.service != 'crunchy'}
											value={store.downloadOptions.hslang ?? ''}
											onChange={(e) => {
												dispatch({
													type: 'downloadOptions',
													payload: { ...store.downloadOptions, hslang: (e.target.value as string) === '' ? undefined : (e.target.value as string) }
												});
											}}
										>
											<MenuItem value="">Sem Hardsub</MenuItem>
											{availableSubs.map((lang) => {
												if (lang === 'all' || lang === 'none') return undefined;
												return <MenuItem value={lang}>{lang}</MenuItem>;
											})}
										</Select>
									</FormControl>
								</Box>

								<Tooltip
									title={
										<Typography>
											Baixa a versão com legenda "queimada" no vídeo.
											<br />
											As legendas ficam visíveis <b>PERMANENTEMENTE!</b>
											<br />
											Você pode escolher apenas <b>1</b> idioma por vídeo!
										</Typography>
									}
									arrow
									placement="top"
								>
									<InfoOutlinedIcon
										sx={{
											transition: '100ms',
											ml: '0.35rem',
											mr: '0.65rem',
											'&:hover': {
												color: '#ffffff30'
											}
										}}
									/>
								</Tooltip>
							</Box>
						</Tooltip>
					</Box>
				</Box>
				<Box sx={{ width: '95%', height: '0.3rem', backgroundColor: '#ffffff50', borderRadius: '10px', marginBottom: '20px' }} />
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						width: '100%',
						gap: '15px'
					}}
				>
					<TextField
						value={store.downloadOptions.fileName ?? ''}
						onChange={(e) => {
							dispatch({
								type: 'downloadOptions',
								payload: { ...store.downloadOptions, fileName: e.target.value }
							});
						}}
						sx={{ width: '87%' }}
						label="Sobrescrever Nome do Arquivo"
					/>
					<Tooltip title={<Typography>Clique aqui para ver a documentação</Typography>} arrow placement="top">
						<Link href="https://github.com/anidl/multi-downloader-nx/blob/master/docs/DOCUMENTATION.md#filename-template" rel="noopener noreferrer" target="_blank">
							<InfoOutlinedIcon
								sx={{
									transition: '100ms',
									'&:hover': {
										color: '#ffffff30'
									}
								}}
							/>
						</Link>
					</Tooltip>
				</Box>
			</Box>
			<Box sx={{ width: '95%', height: '0.3rem', backgroundColor: '#ffffff50', borderRadius: '10px', marginTop: '10px' }} />

			<LoadingButton sx={{ margin: '15px', textTransform: 'none' }} loading={loading} onClick={addToQueue} variant="contained">
				Adicionar à Fila
			</LoadingButton>
		</Box>
	);
};

export default DownloadSelector;
