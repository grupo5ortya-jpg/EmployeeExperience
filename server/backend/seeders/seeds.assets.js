
module.exports = async function (sequelize) {
	const { Asset } = sequelize.models;

	const count = await Asset.count();
	if (count > 0) {
		return;
	}

	const assets = [
		// Computadoras
		{ name: 'MacBook Pro 14"',  serial_number: 'MBP-2024-001', description: 'Laptop MacBook Pro de 14 pulgadas' },
		{ name: 'MacBook Pro 16"',  serial_number: 'MBP-2024-001', description: 'Laptop MacBook Pro de 16 pulgadas' },
		{ name: 'Dell XPS 13',      serial_number: 'DXP-2024-001', description: 'Laptop Dell XPS 13' },
		{ name: 'Desktop iMac 27"', serial_number: 'IMC-2024-001', description: 'Desktop iMac de 27 pulgadas' },
		{ name: 'MacBook Pro 14"',  serial_number: 'MBP-2024-002', description: 'Laptop MacBook Pro de 14 pulgadas' },
		{ name: 'MacBook Pro 16"',  serial_number: 'MBP-2024-002', description: 'Laptop MacBook Pro de 16 pulgadas' },
		{ name: 'Dell XPS 13',      serial_number: 'DXP-2024-002', description: 'Laptop Dell XPS 13' },
		{ name: 'Desktop iMac 27"', serial_number: 'IMC-2024-002', description: 'Desktop iMac de 27 pulgadas' },
		{ name: 'MacBook Pro 14"',  serial_number: 'MBP-2024-003', description: 'Laptop MacBook Pro de 14 pulgadas' },
		{ name: 'MacBook Pro 16"',  serial_number: 'MBP-2024-003', description: 'Laptop MacBook Pro de 16 pulgadas' },
		{ name: 'Dell XPS 13',      serial_number: 'DXP-2024-003', description: 'Laptop Dell XPS 13' },
		{ name: 'Desktop iMac 27"', serial_number: 'IMC-2024-003', description: 'Desktop iMac de 27 pulgadas' },
		{ name: 'MacBook Pro 14"',  serial_number: 'MBP-2024-004', description: 'Laptop MacBook Pro de 14 pulgadas' },
		{ name: 'MacBook Pro 16"',  serial_number: 'MBP-2024-004', description: 'Laptop MacBook Pro de 16 pulgadas' },
		{ name: 'Dell XPS 13',      serial_number: 'DXP-2024-004', description: 'Laptop Dell XPS 13' },
		{ name: 'Desktop iMac 27"', serial_number: 'IMC-2024-004', description: 'Desktop iMac de 27 pulgadas' },
		{ name: 'MacBook Pro 14"',  serial_number: 'MBP-2024-005', description: 'Laptop MacBook Pro de 14 pulgadas' },
		{ name: 'MacBook Pro 16"',  serial_number: 'MBP-2024-005', description: 'Laptop MacBook Pro de 16 pulgadas' },
		{ name: 'Dell XPS 13',      serial_number: 'DXP-2024-005', description: 'Laptop Dell XPS 13' },
		{ name: 'Desktop iMac 27"', serial_number: 'IMC-2024-005', description: 'Desktop iMac de 27 pulgadas' },
		{ name: 'MacBook Pro 14"',  serial_number: 'MBP-2024-006', description: 'Laptop MacBook Pro de 14 pulgadas' },
		{ name: 'MacBook Pro 16"',  serial_number: 'MBP-2024-006', description: 'Laptop MacBook Pro de 16 pulgadas' },
		{ name: 'Dell XPS 13',      serial_number: 'DXP-2024-006', description: 'Laptop Dell XPS 13' },
		{ name: 'Desktop iMac 27"', serial_number: 'IMC-2024-006', description: 'Desktop iMac de 27 pulgadas' },
		{ name: 'MacBook Pro 14"',  serial_number: 'MBP-2024-007', description: 'Laptop MacBook Pro de 14 pulgadas' },
		{ name: 'MacBook Pro 16"',  serial_number: 'MBP-2024-007', description: 'Laptop MacBook Pro de 16 pulgadas' },
		{ name: 'Dell XPS 13',      serial_number: 'DXP-2024-007', description: 'Laptop Dell XPS 13' },
		{ name: 'Desktop iMac 27"', serial_number: 'IMC-2024-007', description: 'Desktop iMac de 27 pulgadas' },
		{ name: 'MacBook Pro 14"',  serial_number: 'MBP-2024-008', description: 'Laptop MacBook Pro de 14 pulgadas' },
		{ name: 'MacBook Pro 16"',  serial_number: 'MBP-2024-008', description: 'Laptop MacBook Pro de 16 pulgadas' },
		{ name: 'Dell XPS 13',      serial_number: 'DXP-2024-008', description: 'Laptop Dell XPS 13' },
		{ name: 'Desktop iMac 27"', serial_number: 'IMC-2024-008', description: 'Desktop iMac de 27 pulgadas' },

		// Monitores
		{ name: 'Monitor LG 27" 4K',        serial_number: 'LGM-27-001', description: 'Monitor LG 27 pulgadas 4K' },
		{ name: 'Monitor Dell 24" Full HD', serial_number: 'DLM-24-001', description: 'Monitor Dell 24 pulgadas Full HD' },
		{ name: 'Monitor ASUS 32"',         serial_number: 'ASM-32-001', description: 'Monitor ASUS 32 pulgadas' },
		{ name: 'Monitor LG 27" 4K',        serial_number: 'LGM-27-002', description: 'Monitor LG 27 pulgadas 4K' },
		{ name: 'Monitor Dell 24" Full HD', serial_number: 'DLM-24-002', description: 'Monitor Dell 24 pulgadas Full HD' },
		{ name: 'Monitor ASUS 32"',         serial_number: 'ASM-32-002', description: 'Monitor ASUS 32 pulgadas' },
		{ name: 'Monitor LG 27" 4K',        serial_number: 'LGM-27-003', description: 'Monitor LG 27 pulgadas 4K' },
		{ name: 'Monitor Dell 24" Full HD', serial_number: 'DLM-24-003', description: 'Monitor Dell 24 pulgadas Full HD' },
		{ name: 'Monitor ASUS 32"',         serial_number: 'ASM-32-003', description: 'Monitor ASUS 32 pulgadas' },
		{ name: 'Monitor LG 27" 4K',        serial_number: 'LGM-27-004', description: 'Monitor LG 27 pulgadas 4K' },
		{ name: 'Monitor Dell 24" Full HD', serial_number: 'DLM-24-004', description: 'Monitor Dell 24 pulgadas Full HD' },
		{ name: 'Monitor ASUS 32"',         serial_number: 'ASM-32-004', description: 'Monitor ASUS 32 pulgadas' },
		{ name: 'Monitor LG 27" 4K',        serial_number: 'LGM-27-005', description: 'Monitor LG 27 pulgadas 4K' },
		{ name: 'Monitor Dell 24" Full HD', serial_number: 'DLM-24-005', description: 'Monitor Dell 24 pulgadas Full HD' },
		{ name: 'Monitor ASUS 32"',         serial_number: 'ASM-32-005', description: 'Monitor ASUS 32 pulgadas' },
		{ name: 'Monitor LG 27" 4K',        serial_number: 'LGM-27-006', description: 'Monitor LG 27 pulgadas 4K' },
		{ name: 'Monitor Dell 24" Full HD', serial_number: 'DLM-24-006', description: 'Monitor Dell 24 pulgadas Full HD' },
		{ name: 'Monitor ASUS 32"',         serial_number: 'ASM-32-006', description: 'Monitor ASUS 32 pulgadas' },
		{ name: 'Monitor LG 27" 4K',        serial_number: 'LGM-27-007', description: 'Monitor LG 27 pulgadas 4K' },
		{ name: 'Monitor Dell 24" Full HD', serial_number: 'DLM-24-007', description: 'Monitor Dell 24 pulgadas Full HD' },
		{ name: 'Monitor ASUS 32"',         serial_number: 'ASM-32-007', description: 'Monitor ASUS 32 pulgadas' },
		{ name: 'Monitor LG 27" 4K',        serial_number: 'LGM-27-008', description: 'Monitor LG 27 pulgadas 4K' },
		{ name: 'Monitor Dell 24" Full HD', serial_number: 'DLM-24-008', description: 'Monitor Dell 24 pulgadas Full HD' },
		{ name: 'Monitor ASUS 32"',         serial_number: 'ASM-32-008', description: 'Monitor ASUS 32 pulgadas' },
		{ name: 'Monitor LG 27" 4K',        serial_number: 'LGM-27-009', description: 'Monitor LG 27 pulgadas 4K' },
		{ name: 'Monitor Dell 24" Full HD', serial_number: 'DLM-24-009', description: 'Monitor Dell 24 pulgadas Full HD' },
		{ name: 'Monitor ASUS 32"',         serial_number: 'ASM-32-009', description: 'Monitor ASUS 32 pulgadas' },
		{ name: 'Monitor LG 27" 4K',        serial_number: 'LGM-27-010', description: 'Monitor LG 27 pulgadas 4K' },
		{ name: 'Monitor Dell 24" Full HD', serial_number: 'DLM-24-010', description: 'Monitor Dell 24 pulgadas Full HD' },
		{ name: 'Monitor ASUS 32"',         serial_number: 'ASM-32-010', description: 'Monitor ASUS 32 pulgadas' },

		// Periféricos
		{ name: 'Teclado mecánico Logitech',   serial_number: 'KEY-LOG-001', description: 'Teclado mecánico Logitech RGB' },
		{ name: 'Mouse Logitech MX Master 3S', serial_number: 'MOUSE-LGM3S-001', description: 'Mouse Logitech MX Master 3S' },
		{ name: 'Trackpad Magic',              serial_number: 'TRACK-001', description: 'Trackpad Magic Apple' },
		{ name: 'Headphones Sony WH-1000XM5',  serial_number: 'HP-SONY-001', description: 'Headphones inalámbricos Sony WH-1000XM5' },
		{ name: 'Headset AirPods Pro',         serial_number: 'AP-PRO-001', description: 'Headphones AirPods Pro' },
		{ name: 'Teclado mecánico Logitech',   serial_number: 'KEY-LOG-002', description: 'Teclado mecánico Logitech RGB' },
		{ name: 'Mouse Logitech MX Master 3S', serial_number: 'MOUSE-LGM3S-002', description: 'Mouse Logitech MX Master 3S' },
		{ name: 'Trackpad Magic',              serial_number: 'TRACK-002', description: 'Trackpad Magic Apple' },
		{ name: 'Headphones Sony WH-1000XM5',  serial_number: 'HP-SONY-002', description: 'Headphones inalámbricos Sony WH-1000XM5' },
		{ name: 'Headset AirPods Pro',         serial_number: 'AP-PRO-002', description: 'Headphones AirPods Pro' },
		{ name: 'Teclado mecánico Logitech',   serial_number: 'KEY-LOG-003', description: 'Teclado mecánico Logitech RGB' },
		{ name: 'Mouse Logitech MX Master 3S', serial_number: 'MOUSE-LGM3S-003', description: 'Mouse Logitech MX Master 3S' },
		{ name: 'Trackpad Magic',              serial_number: 'TRACK-003', description: 'Trackpad Magic Apple' },
		{ name: 'Headphones Sony WH-1000XM5',  serial_number: 'HP-SONY-003', description: 'Headphones inalámbricos Sony WH-1000XM5' },
		{ name: 'Headset AirPods Pro',         serial_number: 'AP-PRO-003', description: 'Headphones AirPods Pro' },
		{ name: 'Teclado mecánico Logitech',   serial_number: 'KEY-LOG-004', description: 'Teclado mecánico Logitech RGB' },
		{ name: 'Mouse Logitech MX Master 3S', serial_number: 'MOUSE-LGM3S-004', description: 'Mouse Logitech MX Master 3S' },
		{ name: 'Trackpad Magic',              serial_number: 'TRACK-004', description: 'Trackpad Magic Apple' },
		{ name: 'Headphones Sony WH-1000XM5',  serial_number: 'HP-SONY-004', description: 'Headphones inalámbricos Sony WH-1000XM5' },
		{ name: 'Headset AirPods Pro',         serial_number: 'AP-PRO-005', description: 'Headphones AirPods Pro' },
		{ name: 'Teclado mecánico Logitech',   serial_number: 'KEY-LOG-005', description: 'Teclado mecánico Logitech RGB' },
		{ name: 'Mouse Logitech MX Master 3S', serial_number: 'MOUSE-LGM3S-005', description: 'Mouse Logitech MX Master 3S' },
		{ name: 'Trackpad Magic',              serial_number: 'TRACK-005', description: 'Trackpad Magic Apple' },
		{ name: 'Headphones Sony WH-1000XM5',  serial_number: 'HP-SONY-006', description: 'Headphones inalámbricos Sony WH-1000XM5' },
		{ name: 'Headset AirPods Pro',         serial_number: 'AP-PRO-006', description: 'Headphones AirPods Pro' },
		{ name: 'Teclado mecánico Logitech',   serial_number: 'KEY-LOG-006', description: 'Teclado mecánico Logitech RGB' },
		{ name: 'Mouse Logitech MX Master 3S', serial_number: 'MOUSE-LGM3S-006', description: 'Mouse Logitech MX Master 3S' },
		{ name: 'Trackpad Magic',              serial_number: 'TRACK-007', description: 'Trackpad Magic Apple' },
		{ name: 'Headphones Sony WH-1000XM5',  serial_number: 'HP-SONY-007', description: 'Headphones inalámbricos Sony WH-1000XM5' },
		{ name: 'Headset AirPods Pro',         serial_number: 'AP-PRO-007', description: 'Headphones AirPods Pro' },
		{ name: 'Teclado mecánico Logitech',   serial_number: 'KEY-LOG-007', description: 'Teclado mecánico Logitech RGB' },
		{ name: 'Mouse Logitech MX Master 3S', serial_number: 'MOUSE-LGM3S-008', description: 'Mouse Logitech MX Master 3S' },
		{ name: 'Trackpad Magic',              serial_number: 'TRACK-008', description: 'Trackpad Magic Apple' },
		{ name: 'Headphones Sony WH-1000XM5',  serial_number: 'HP-SONY-008', description: 'Headphones inalámbricos Sony WH-1000XM5' },
		{ name: 'Headset AirPods Pro',         serial_number: 'AP-PRO-008', description: 'Headphones AirPods Pro' },

		// Accesorios
		{ name: 'Docking Station USB-C', serial_number: 'DOCK-001', description: 'Docking Station Universal USB-C' },
		{ name: 'Cable HDMI 2.1', serial_number: 'CABLE-HDMI-001', description: 'Cable HDMI 2.1 de alta velocidad' },
		{ name: 'Adaptador USB-C a HDMI', serial_number: 'ADP-USB-HDMI-001', description: 'Adaptador USB-C a HDMI' },
		{ name: 'Hub USB 3.0', serial_number: 'HUB-USB3-001', description: 'Hub USB 3.0 de 7 puertos' },
		{ name: 'Webcam Logitech 4K', serial_number: 'CAM-LOG-4K-001', description: 'Webcam Logitech 4K pro' },

		// Seguridad
		{ name: 'YubiKey 5', serial_number: 'YUBI-5-001', description: 'YubiKey 5 - llave de seguridad' },
		{ name: 'Lector de tarjetas inteligentes', serial_number: 'CARD-READER-001', description: 'Lector de tarjetas inteligentes USB' },

		// Almacenamiento
		{ name: 'SSD Externo 1TB', serial_number: 'SSD-EXT-1TB-001', description: 'Unidad SSD externa 1TB' },
		{ name: 'SSD Externo 2TB', serial_number: 'SSD-EXT-2TB-001', description: 'Unidad SSD externa 2TB' },

		// Otros
		{ name: 'Insignia de empleado', serial_number: 'BADGE-001', description: 'Insignia de acceso al edificio' },
		{ name: 'Cable de alimentación AC', serial_number: 'PWR-CABLE-001', description: 'Cable de alimentación AC estándar' },
		{ name: 'Adaptador de corriente', serial_number: 'PSU-ADAPTER-001', description: 'Adaptador de corriente 100W USB-C' },
	];

	await Asset.bulkCreate(assets, { individualHooks: true });
};
