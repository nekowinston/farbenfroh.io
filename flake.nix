{
  description = "farbenfroh - web app for faerber";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay.url = "github:oxalica/rust-overlay";
    pre-commit-hooks.url = "github:cachix/pre-commit-hooks.nix";
    pre-commit-hooks.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    rust-overlay,
    pre-commit-hooks,
  }:
    flake-utils.lib.eachDefaultSystem
    (
      system: let
        overlays = [(import rust-overlay)];
        pkgs = import nixpkgs {
          inherit system overlays;
        };
      in {
        devShells.default = pkgs.mkShell {
          inherit (self.checks.${system}.pre-commit-check) shellHook;

          buildInputs = with pkgs; [
            (rust-bin.fromRustupToolchainFile ./rust-toolchain.toml)
            binaryen
            nodejs-18_x
            wasm-bindgen-cli
            wasm-pack
            yarn
          ];
        };

        checks = {
          pre-commit-check = pre-commit-hooks.lib.${system}.run {
            src = ./.;
            hooks = {
              # custom wasm clippy version
              clippy-wasm = {
                enable = true;
                name = "clippy";
                description = "Lint Rust code.";
                entry = "cargo clippy --target wasm32-unknown-unknown";
                files = "\\.rs$";
                pass_filenames = false;
              };
              rustfmt.enable = true;
              prettier.enable = true;
            };
          };
        };
      }
    );
}
